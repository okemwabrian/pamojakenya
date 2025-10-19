# Backend Fix for admin_panel/views.py
# Replace the deduct_shares_all method with this corrected version:

@action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
def deduct_shares_all(self, request):
    try:
        # Get amount from request and convert to float
        amount = request.data.get('amount')
        if not amount:
            return Response({'error': 'Amount is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            amount = float(amount)  # Convert string to float
        except (ValueError, TypeError):
            return Response({'error': 'Invalid amount format'}, status=status.HTTP_400_BAD_REQUEST)
        
        if amount <= 0:
            return Response({'error': 'Amount must be greater than 0'}, status=status.HTTP_400_BAD_REQUEST)
        
        reason = request.data.get('reason', 'Admin deduction')
        
        # Get all users with shares > 0
        users_with_shares = User.objects.filter(shares_owned__gt=0)
        
        if not users_with_shares.exists():
            return Response({'error': 'No users with shares found'}, status=status.HTTP_400_BAD_REQUEST)
        
        updated_count = 0
        for user in users_with_shares:
            if user.shares_owned >= amount:
                user.shares_owned -= amount
                user.save()
                updated_count += 1
                
                # Log the deduction
                ShareTransaction.objects.create(
                    user=user,
                    amount=-amount,
                    transaction_type='deduction',
                    description=f'Admin deduction: {reason}',
                    admin_user=request.user
                )
        
        return Response({
            'message': f'Successfully deducted {amount} shares from {updated_count} users',
            'users_updated': updated_count
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
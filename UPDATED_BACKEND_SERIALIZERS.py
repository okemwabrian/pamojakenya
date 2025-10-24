# Updated Django Serializers for Pamoja Application System
# Add these to your Django backend serializers.py

from rest_framework import serializers
from .models import SingleApplication, DoubleApplication, SharePurchase, ActivationFeePayment

class SingleApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SingleApplication
        fields = [
            'id', 'firstName', 'middleName', 'lastName', 'email', 'phoneMain',
            'address1', 'city', 'stateProvince', 'zip',
            'spouse', 'spousePhone', 'spouseCellPhone', 'authorizedRep',  # spouseCellPhone is new
            'child1', 'child2', 'child3', 'child4', 'child5',
            'parent1', 'parent2', 'spouseParent1', 'spouseParent2',
            'sibling1', 'sibling2',
            'id_document', 'declarationAccepted',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class DoubleApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoubleApplication
        fields = [
            'id', 'first_name', 'middle_name', 'last_name', 'email', 'confirm_email', 'phone',
            'address_1', 'address_2', 'city', 'state_province', 'zip_postal',
            'spouse_name', 'spouse_phone', 'authorized_rep',
            'child_1', 'child_2', 'child_3', 'child_4', 'child_5',
            'parent_1', 'parent_2', 'spouse_parent_1', 'spouse_parent_2',
            'step_parent_1', 'step_parent_2',  # New fields
            'sibling_1', 'sibling_2', 'sibling_3',
            'step_sibling_1', 'step_sibling_2', 'step_sibling_3',  # New fields
            'id_document', 'constitution_agreed',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        if data.get('email') != data.get('confirm_email'):
            raise serializers.ValidationError("Email addresses do not match")
        return data

class SharePurchaseSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = SharePurchase
        fields = [
            'id', 'user', 'user_name', 'user_email', 'amount', 'shares_requested', 
            'shares_assigned', 'payment_method', 'transaction_id', 'notes', 
            'admin_notes', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'shares_assigned', 'admin_notes', 'status']

class ActivationFeePaymentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = ActivationFeePayment
        fields = [
            'id', 'user', 'user_name', 'user_email', 'payment_method', 
            'transaction_id', 'amount', 'notes', 'evidence_file', 
            'status', 'admin_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'status', 'admin_notes']
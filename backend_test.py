import requests
import sys
import json
from datetime import datetime, timedelta

class VaalticCRMTester:
    def __init__(self, base_url="https://35829d7c-d4a6-4f8e-8528-95da9b96a75d.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.admin_token = None
        self.customer_token = None
        self.admin_user = None
        self.customer_user = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_resources = {
            'leads': [],
            'contacts': [],
            'deals': []
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and 'id' in response_data:
                        print(f"   Created resource ID: {response_data['id']}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration for both admin and customer"""
        print("\n" + "="*50)
        print("TESTING USER REGISTRATION")
        print("="*50)
        
        # Test admin registration
        admin_data = {
            "email": "admin@vaaltic.com",
            "password": "password",
            "full_name": "Admin User",
            "role": "admin"
        }
        
        success, response = self.run_test(
            "Admin Registration",
            "POST",
            "auth/register",
            200,
            data=admin_data
        )
        
        if success:
            self.admin_user = response
            print(f"   Admin user created: {response.get('email')}")
        
        # Test customer registration
        customer_data = {
            "email": "user@vaaltic.com", 
            "password": "password",
            "full_name": "Customer User",
            "role": "customer"
        }
        
        success, response = self.run_test(
            "Customer Registration",
            "POST",
            "auth/register",
            200,
            data=customer_data
        )
        
        if success:
            self.customer_user = response
            print(f"   Customer user created: {response.get('email')}")

    def test_user_login(self):
        """Test user login for both roles"""
        print("\n" + "="*50)
        print("TESTING USER LOGIN")
        print("="*50)
        
        # Test admin login
        admin_login = {
            "email": "admin@vaaltic.com",
            "password": "password"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data=admin_login
        )
        
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            print(f"   Admin token obtained")
        
        # Test customer login
        customer_login = {
            "email": "user@vaaltic.com",
            "password": "password"
        }
        
        success, response = self.run_test(
            "Customer Login",
            "POST",
            "auth/login",
            200,
            data=customer_login
        )
        
        if success and 'access_token' in response:
            self.customer_token = response['access_token']
            print(f"   Customer token obtained")

    def test_auth_me(self):
        """Test getting current user info"""
        print("\n" + "="*50)
        print("TESTING AUTH/ME ENDPOINT")
        print("="*50)
        
        if self.admin_token:
            success, response = self.run_test(
                "Get Admin User Info",
                "GET",
                "auth/me",
                200,
                token=self.admin_token
            )
            if success:
                print(f"   Admin user: {response.get('email')} - Role: {response.get('role')}")
        
        if self.customer_token:
            success, response = self.run_test(
                "Get Customer User Info",
                "GET",
                "auth/me",
                200,
                token=self.customer_token
            )
            if success:
                print(f"   Customer user: {response.get('email')} - Role: {response.get('role')}")

    def test_lead_management(self):
        """Test lead CRUD operations"""
        print("\n" + "="*50)
        print("TESTING LEAD MANAGEMENT")
        print("="*50)
        
        if not self.admin_token:
            print("❌ No admin token available for lead testing")
            return
        
        # Create lead
        lead_data = {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "+1234567890",
            "company": "Test Company",
            "stage": "new",
            "source": "website",
            "notes": "Test lead for CRM testing"
        }
        
        success, response = self.run_test(
            "Create Lead",
            "POST",
            "leads",
            200,
            data=lead_data,
            token=self.admin_token
        )
        
        lead_id = None
        if success and 'id' in response:
            lead_id = response['id']
            self.created_resources['leads'].append(lead_id)
        
        # Get all leads
        success, response = self.run_test(
            "Get All Leads",
            "GET",
            "leads",
            200,
            token=self.admin_token
        )
        
        if success:
            print(f"   Found {len(response)} leads")
        
        # Update lead if we have one
        if lead_id:
            update_data = {
                "name": "John Doe Updated",
                "email": "john.doe@example.com",
                "phone": "+1234567890",
                "company": "Test Company Updated",
                "stage": "contacted",
                "source": "website",
                "notes": "Updated test lead"
            }
            
            success, response = self.run_test(
                "Update Lead",
                "PUT",
                f"leads/{lead_id}",
                200,
                data=update_data,
                token=self.admin_token
            )
            
            # Delete lead
            success, response = self.run_test(
                "Delete Lead",
                "DELETE",
                f"leads/{lead_id}",
                200,
                token=self.admin_token
            )

    def test_contact_management(self):
        """Test contact CRUD operations"""
        print("\n" + "="*50)
        print("TESTING CONTACT MANAGEMENT")
        print("="*50)
        
        if not self.admin_token:
            print("❌ No admin token available for contact testing")
            return
        
        # Create contact
        contact_data = {
            "name": "Jane Smith",
            "email": "jane.smith@example.com",
            "phone": "+1987654321",
            "company": "Smith Corp",
            "position": "CEO"
        }
        
        success, response = self.run_test(
            "Create Contact",
            "POST",
            "contacts",
            200,
            data=contact_data,
            token=self.admin_token
        )
        
        contact_id = None
        if success and 'id' in response:
            contact_id = response['id']
            self.created_resources['contacts'].append(contact_id)
        
        # Get all contacts
        success, response = self.run_test(
            "Get All Contacts",
            "GET",
            "contacts",
            200,
            token=self.admin_token
        )
        
        if success:
            print(f"   Found {len(response)} contacts")

    def test_deal_management(self):
        """Test deal CRUD operations"""
        print("\n" + "="*50)
        print("TESTING DEAL MANAGEMENT")
        print("="*50)
        
        if not self.admin_token:
            print("❌ No admin token available for deal testing")
            return
        
        # First create a contact for the deal
        contact_data = {
            "name": "Deal Contact",
            "email": "deal.contact@example.com",
            "phone": "+1555666777",
            "company": "Deal Corp",
            "position": "Manager"
        }
        
        success, contact_response = self.run_test(
            "Create Contact for Deal",
            "POST",
            "contacts",
            200,
            data=contact_data,
            token=self.admin_token
        )
        
        if not success or 'id' not in contact_response:
            print("❌ Failed to create contact for deal testing")
            return
        
        contact_id = contact_response['id']
        
        # Create deal
        deal_data = {
            "title": "Big Deal",
            "value": 50000.0,
            "expected_close_date": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "stage": "prospect",
            "description": "A big test deal",
            "contact_id": contact_id
        }
        
        success, response = self.run_test(
            "Create Deal",
            "POST",
            "deals",
            200,
            data=deal_data,
            token=self.admin_token
        )
        
        deal_id = None
        if success and 'id' in response:
            deal_id = response['id']
            self.created_resources['deals'].append(deal_id)
        
        # Get all deals
        success, response = self.run_test(
            "Get All Deals",
            "GET",
            "deals",
            200,
            token=self.admin_token
        )
        
        if success:
            print(f"   Found {len(response)} deals")
        
        # Update deal if we have one
        if deal_id:
            update_data = {
                "title": "Updated Big Deal",
                "value": 75000.0,
                "expected_close_date": (datetime.utcnow() + timedelta(days=45)).isoformat(),
                "stage": "proposal",
                "description": "An updated big test deal",
                "contact_id": contact_id
            }
            
            success, response = self.run_test(
                "Update Deal",
                "PUT",
                f"deals/{deal_id}",
                200,
                data=update_data,
                token=self.admin_token
            )

    def test_analytics_dashboard(self):
        """Test dashboard analytics endpoint"""
        print("\n" + "="*50)
        print("TESTING ANALYTICS DASHBOARD")
        print("="*50)
        
        if self.admin_token:
            success, response = self.run_test(
                "Get Admin Dashboard Analytics",
                "GET",
                "analytics/dashboard",
                200,
                token=self.admin_token
            )
            
            if success:
                print(f"   Total Leads: {response.get('total_leads', 0)}")
                print(f"   Total Contacts: {response.get('total_contacts', 0)}")
                print(f"   Total Deals: {response.get('total_deals', 0)}")
                print(f"   Won Deals: {response.get('won_deals', 0)}")
                print(f"   Pipeline Value: ${response.get('pipeline_value', 0)}")
                print(f"   Conversion Rate: {response.get('conversion_rate', 0)}%")
        
        if self.customer_token:
            success, response = self.run_test(
                "Get Customer Dashboard Analytics",
                "GET",
                "analytics/dashboard",
                200,
                token=self.customer_token
            )
            
            if success:
                print(f"   Customer Total Leads: {response.get('total_leads', 0)}")
                print(f"   Customer Total Contacts: {response.get('total_contacts', 0)}")

    def test_role_based_access(self):
        """Test role-based access control"""
        print("\n" + "="*50)
        print("TESTING ROLE-BASED ACCESS CONTROL")
        print("="*50)
        
        if not self.customer_token:
            print("❌ No customer token available for role testing")
            return
        
        # Customer should be able to create their own leads
        lead_data = {
            "name": "Customer Lead",
            "email": "customer.lead@example.com",
            "phone": "+1111222333",
            "company": "Customer Company",
            "stage": "new",
            "source": "referral",
            "notes": "Lead created by customer"
        }
        
        success, response = self.run_test(
            "Customer Create Lead",
            "POST",
            "leads",
            200,
            data=lead_data,
            token=self.customer_token
        )
        
        # Customer should only see their own leads
        success, response = self.run_test(
            "Customer Get Own Leads",
            "GET",
            "leads",
            200,
            token=self.customer_token
        )
        
        if success:
            print(f"   Customer can see {len(response)} leads (should only be their own)")

def main():
    print("🚀 Starting VAALTIC CRM Backend API Testing")
    print("=" * 60)
    
    tester = VaalticCRMTester()
    
    # Run all tests
    tester.test_user_registration()
    tester.test_user_login()
    tester.test_auth_me()
    tester.test_lead_management()
    tester.test_contact_management()
    tester.test_deal_management()
    tester.test_analytics_dashboard()
    tester.test_role_based_access()
    
    # Print final results
    print("\n" + "="*60)
    print("📊 FINAL TEST RESULTS")
    print("="*60)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
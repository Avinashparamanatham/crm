from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import hashlib
import jwt
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# JWT Configuration
SECRET_KEY = "vaaltic-crm-secret-key-2025"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

security = HTTPBearer()

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    CUSTOMER = "customer"

class LeadStage(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    CONVERTED = "converted"

class LeadSource(str, Enum):
    WEBSITE = "website"
    REFERRAL = "referral"
    CALL = "call"
    CAMPAIGN = "campaign"

class DealStage(str, Enum):
    PROSPECT = "prospect"
    PROPOSAL = "proposal"
    NEGOTIATION = "negotiation"
    WON = "won"
    LOST = "lost"

# Models
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.CUSTOMER

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class LeadBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    stage: LeadStage = LeadStage.NEW
    source: LeadSource = LeadSource.WEBSITE
    notes: Optional[str] = None

class LeadCreate(LeadBase):
    assigned_to: Optional[str] = None

class Lead(LeadBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    assigned_to: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class DealBase(BaseModel):
    title: str
    value: float
    expected_close_date: datetime
    stage: DealStage = DealStage.PROSPECT
    description: Optional[str] = None

class DealCreate(DealBase):
    contact_id: str

class Deal(DealBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    contact_id: str
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ContactBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    position: Optional[str] = None

class ContactCreate(ContactBase):
    pass

class Contact(ContactBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Utility functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await db.users.find_one({"email": email})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return User(**user)

# Authentication Routes
@api_router.post("/auth/register", response_model=User)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_dict = user_data.dict()
    user_dict["password"] = hash_password(user_data.password)
    user_obj = User(**user_dict)
    
    await db.users.insert_one(user_obj.dict())
    return user_obj

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    user_obj = User(**user)
    return Token(access_token=access_token, token_type="bearer", user=user_obj)

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# Lead Management Routes
@api_router.post("/leads", response_model=Lead)
async def create_lead(lead_data: LeadCreate, current_user: User = Depends(get_current_user)):
    lead_dict = lead_data.dict()
    lead_dict["created_by"] = current_user.id
    lead_obj = Lead(**lead_dict)
    
    await db.leads.insert_one(lead_obj.dict())
    return lead_obj

@api_router.get("/leads", response_model=List[Lead])
async def get_leads(current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.ADMIN:
        leads = await db.leads.find().to_list(1000)
    else:
        leads = await db.leads.find({"created_by": current_user.id}).to_list(1000)
    
    return [Lead(**lead) for lead in leads]

@api_router.put("/leads/{lead_id}", response_model=Lead)
async def update_lead(lead_id: str, lead_data: LeadCreate, current_user: User = Depends(get_current_user)):
    lead = await db.leads.find_one({"id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    if current_user.role != UserRole.ADMIN and lead["created_by"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this lead")
    
    update_dict = lead_data.dict()
    update_dict["updated_at"] = datetime.utcnow()
    
    await db.leads.update_one({"id": lead_id}, {"$set": update_dict})
    
    updated_lead = await db.leads.find_one({"id": lead_id})
    return Lead(**updated_lead)

@api_router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str, current_user: User = Depends(get_current_user)):
    lead = await db.leads.find_one({"id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    if current_user.role != UserRole.ADMIN and lead["created_by"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this lead")
    
    await db.leads.delete_one({"id": lead_id})
    return {"message": "Lead deleted successfully"}

# Contact Management Routes
@api_router.post("/contacts", response_model=Contact)
async def create_contact(contact_data: ContactCreate, current_user: User = Depends(get_current_user)):
    contact_dict = contact_data.dict()
    contact_dict["created_by"] = current_user.id
    contact_obj = Contact(**contact_dict)
    
    await db.contacts.insert_one(contact_obj.dict())
    return contact_obj

@api_router.get("/contacts", response_model=List[Contact])
async def get_contacts(current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.ADMIN:
        contacts = await db.contacts.find().to_list(1000)
    else:
        contacts = await db.contacts.find({"created_by": current_user.id}).to_list(1000)
    
    return [Contact(**contact) for contact in contacts]

# Deal Management Routes
@api_router.post("/deals", response_model=Deal)
async def create_deal(deal_data: DealCreate, current_user: User = Depends(get_current_user)):
    # Verify contact exists
    contact = await db.contacts.find_one({"id": deal_data.contact_id})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    deal_dict = deal_data.dict()
    deal_dict["created_by"] = current_user.id
    deal_obj = Deal(**deal_dict)
    
    await db.deals.insert_one(deal_obj.dict())
    return deal_obj

@api_router.get("/deals", response_model=List[Deal])
async def get_deals(current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.ADMIN:
        deals = await db.deals.find().to_list(1000)
    else:
        deals = await db.deals.find({"created_by": current_user.id}).to_list(1000)
    
    return [Deal(**deal) for deal in deals]

@api_router.put("/deals/{deal_id}", response_model=Deal)
async def update_deal(deal_id: str, deal_data: DealCreate, current_user: User = Depends(get_current_user)):
    deal = await db.deals.find_one({"id": deal_id})
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    if current_user.role != UserRole.ADMIN and deal["created_by"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this deal")
    
    update_dict = deal_data.dict()
    update_dict["updated_at"] = datetime.utcnow()
    
    await db.deals.update_one({"id": deal_id}, {"$set": update_dict})
    
    updated_deal = await db.deals.find_one({"id": deal_id})
    return Deal(**updated_deal)

# Analytics Routes
@api_router.get("/analytics/dashboard")
async def get_dashboard_analytics(current_user: User = Depends(get_current_user)):
    # Basic analytics for dashboard
    if current_user.role == UserRole.ADMIN:
        total_leads = await db.leads.count_documents({})
        total_contacts = await db.contacts.count_documents({})
        total_deals = await db.deals.count_documents({})
        won_deals = await db.deals.count_documents({"stage": DealStage.WON})
        
        # Pipeline value calculation
        pipeline_value = 0
        active_deals = await db.deals.find({"stage": {"$in": [DealStage.PROSPECT, DealStage.PROPOSAL, DealStage.NEGOTIATION]}}).to_list(1000)
        for deal in active_deals:
            pipeline_value += deal.get("value", 0)
        
        # Lead stages breakdown
        lead_stages = {}
        for stage in LeadStage:
            count = await db.leads.count_documents({"stage": stage})
            lead_stages[stage.value] = count
    else:
        total_leads = await db.leads.count_documents({"created_by": current_user.id})
        total_contacts = await db.contacts.count_documents({"created_by": current_user.id})
        total_deals = await db.deals.count_documents({"created_by": current_user.id})
        won_deals = await db.deals.count_documents({"created_by": current_user.id, "stage": DealStage.WON})
        
        pipeline_value = 0
        active_deals = await db.deals.find({
            "created_by": current_user.id,
            "stage": {"$in": [DealStage.PROSPECT, DealStage.PROPOSAL, DealStage.NEGOTIATION]}
        }).to_list(1000)
        for deal in active_deals:
            pipeline_value += deal.get("value", 0)
        
        lead_stages = {}
        for stage in LeadStage:
            count = await db.leads.count_documents({"created_by": current_user.id, "stage": stage})
            lead_stages[stage.value] = count
    
    return {
        "total_leads": total_leads,
        "total_contacts": total_contacts,
        "total_deals": total_deals,
        "won_deals": won_deals,
        "pipeline_value": pipeline_value,
        "conversion_rate": (won_deals / total_deals * 100) if total_deals > 0 else 0,
        "lead_stages": lead_stages
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from backend.app.schemas.schemas import UserRegisterRequest, UserLoginRequest, UserResponse, TokenResponse
from backend.app.database import db
from backend.app.utils.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
async def register(req: UserRegisterRequest):
    existing = db.users.find_one({"email": req.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address is already registered."
        )

    # Valid roles
    allowed_roles = ["Administrator", "Government Authority", "Inspector", "Citizen"]
    role = req.role if req.role in allowed_roles else "Citizen"

    user_doc = {
        "name": req.name.strip(),
        "email": req.email.lower().strip(),
        "password_hash": hash_password(req.password),
        "role": role,
        "department": req.department,
        "phone": req.phone,
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

    res = db.users.insert_one(user_doc)
    user_id = str(res.inserted_id)
    
    token = create_access_token({"sub": user_id, "email": user_doc["email"], "role": user_doc["role"]})
    
    user_resp = UserResponse(
        id=user_id,
        name=user_doc["name"],
        email=user_doc["email"],
        role=user_doc["role"],
        department=user_doc.get("department"),
        phone=user_doc.get("phone"),
        created_at=user_doc.get("created_at")
    )
    return TokenResponse(access_token=token, token_type="bearer", user=user_resp)

@router.post("/login", response_model=TokenResponse)
async def login(req: UserLoginRequest):
    user = db.users.find_one({"email": req.email.lower().strip()})
    if not user or not verify_password(req.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )

    user_id = str(user.get("id") or user.get("_id"))
    token = create_access_token({"sub": user_id, "email": user["email"], "role": user.get("role", "Citizen")})

    user_resp = UserResponse(
        id=user_id,
        name=user["name"],
        email=user["email"],
        role=user.get("role", "Citizen"),
        department=user.get("department"),
        phone=user.get("phone"),
        created_at=user.get("created_at")
    )
    return TokenResponse(access_token=token, token_type="bearer", user=user_resp)

@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("id") or current_user.get("_id"))
    return UserResponse(
        id=user_id,
        name=current_user["name"],
        email=current_user["email"],
        role=current_user.get("role", "Citizen"),
        department=current_user.get("department"),
        phone=current_user.get("phone"),
        created_at=current_user.get("created_at")
    )

# Báo cáo Task FIX: D Part 1 — Enterprise Talents Pagination + Invite Endpoint

## 1. Files modified

**Backend:**
- `talenthub/backend/app/models.py` — Thêm model `InterviewInvitation`
- `talenthub/backend/app/schemas.py` — Thêm schemas `InterviewInvitationIn`, `InterviewInvitationOut`
- `talenthub/backend/app/routers/enterprise.py` — Thêm pagination cho `/enterprise/talents`, thêm `POST /enterprise/invite`

**Frontend:**
- `talenthub/frontend/src/pages/enterprise/Talents.tsx` — Pagination controls, nút "Mời phỏng vấn" gọi API

## 2. Backend changes detail

### GET `/enterprise/talents`
- Query params mới: `page` (default 1), `page_size` (default 20, max 100), `min_technical_score`
- Response format:
```json
{
  "items": [...],
  "total": 40,
  "page": 1,
  "page_size": 20,
  "total_pages": 2
}
```
- Technical score tính từ avg level của skills category "chuyen_mon"
- Top 3 skills by level

### POST `/enterprise/invite`
- Body: `{ "student_id": number, "message": string? }`
- Tạo `InterviewInvitation` record, status = "sent"
- Validate: học sinh tồn tại, chưa mời trùng

### Model `InterviewInvitation`
```python
class InterviewInvitation(Base):
    id, enterprise_id, student_id, message, status, sent_at, responded_at
```

## 3. Frontend changes detail

- State: `page`, `pageSize`, `invitingId`, `inviteSuccess`
- Pagination UI: prev/next, page numbers với ellipsis, dropdown page size (10/20/50/100)
- Mỗi row có nút "Mời phỏng vấn" → gọi POST `/invite`, loading state, success toast
- Bảng hiển thị: Họ tên, Lớp, Khối, Năng lực, Kỹ thuật, Top 3 skills, Thao tác (Xem hồ sơ / Mời phỏng vấn)

## 4. Verify results

### Build
```bash
cd talenthub/frontend && pnpm build
# ✅ XANH: built in 1.22s
```

### API tests
```bash
# Pagination
curl "http://127.0.0.1:8000/api/v1/enterprise/talents?page=1&page_size=5"
# {"items":[...],"total":40,"page":1,"page_size":5,"total_pages":8}

curl "http://127.0.0.1:8000/api/v1/enterprise/talents?page=2&page_size=5"
# {"items":[...],"total":40,"page":2,"page_size":5,"total_pages":8}

# Invite
curl -X POST "http://127.0.0.1:8000/api/v1/enterprise/invite" \
  -H "Content-Type: application/json" -d '{"student_id": 7}'
# {"id":1,"enterprise_id":46,"student_id":7,"message":null,"status":"sent","sent_at":"...","responded_at":null}

# Duplicate invite
curl -X POST "http://127.0.0.1:8000/api/v1/enterprise/invite" \
  -H "Content-Type: application/json" -d '{"student_id": 7}'
# {"detail":"Đã gửi lời mời cho học sinh này"} (400)
```

## 5. Diff stat (task-relevant files)
```
 talenthub/backend/app/models.py                    |  20 +
 talenthub/backend/app/schemas.py                   |  57 ++
 talenthub/backend/app/routers/enterprise.py        | 303 +++++++-
 talenthub/frontend/src/pages/enterprise/Talents.tsx | 400 ++++++++++++----
```

## 6. Notes
- Không đụng student/, school/, teacher/, passport/
- Seed đã chạy lại để tạo bảng `interview_invitations`
- Backend reload tự động nhờ `--reload`
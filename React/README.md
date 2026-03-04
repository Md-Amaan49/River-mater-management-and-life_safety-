# Google Drive Video Player

This project fetches and displays videos from a Google Drive folder using Service Account authentication.

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Edit `.env` file and add your Google Drive folder ID:
```
GOOGLE_DRIVE_FOLDER_ID=your_actual_folder_id_here
```

To get your folder ID, open the folder in Google Drive and copy the ID from the URL:
`https://drive.google.com/drive/folders/FOLDER_ID_HERE`

**IMPORTANT:** Share the Google Drive folder with the service account email:
`apadamitra-drive@tapo-videos-project.iam.gserviceaccount.com`

Start the backend:
```bash
npm start
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

## How It Works

- Backend uses Service Account to authenticate with Google Drive API
- No user login required - authentication is automatic
- Frontend requests video list from backend
- Videos are displayed using Google Drive's embed URLs in iframes

## Important Notes

- The Google Drive folder MUST be shared with the service account email
- The folder must contain video files
- Service account has read-only access

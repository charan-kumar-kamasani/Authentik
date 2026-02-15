# Image Upload Setup Guide

## Cloudinary Setup Instructions

To enable image uploads for the profile edit feature, follow these steps:

### 1. Sign Up for Cloudinary
- Go to [Cloudinary.com](https://cloudinary.com/)
- Sign up for a free account
- Verify your email

### 2. Get Your Cloud Name
- After login, go to the **Dashboard**
- Your **Cloud Name** is displayed at the top of the page
- Copy this value

### 3. Create an Upload Preset
- In the Dashboard, go to **Settings** → **Upload**
- Scroll down to **Upload presets**
- Click **Add upload preset**
- Fill in the form:
  - **Upload preset name**: `profile_image` (or any name you prefer)
  - **Signing Mode**: Select `Unsigned`
  - Click **Save**
- Copy the **Upload preset name**

### 4. Add Environment Variables
- In the `frontend` folder, create or update the `.env.local` file:

```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_name_here
VITE_API_BASE_URL=https://authentik-8p39.vercel.app
```

- Replace `your_cloud_name_here` and `your_upload_preset_name_here` with the values you copied

### 5. Restart the Development Server
- Restart your frontend development server for the changes to take effect

## How It Works

1. User clicks **"Edit Image"** button in the Edit Profile page
2. A file picker opens to select an image
3. The image is uploaded to Cloudinary (not to your database)
4. Cloudinary returns a secure URL
5. The URL is stored in the database (User.profileImage field)
6. The image is displayed in the profile avatar immediately

## Features

- ✅ Images upload directly to Cloudinary (no server storage needed)
- ✅ Automatic image optimization by Cloudinary
- ✅ Images are stored as URLs in the database
- ✅ Full profile image display in Edit Profile view
- ✅ Fallback to default avatar if no image is uploaded

## Troubleshooting

If image uploads fail:
1. Check that `VITE_CLOUDINARY_CLOUD_NAME` is correct
2. Check that `VITE_CLOUDINARY_UPLOAD_PRESET` is correct
3. Ensure the upload preset is set to **Unsigned** mode
4. Check browser console for specific error messages
5. Verify that Cloudinary account is active and not restricted

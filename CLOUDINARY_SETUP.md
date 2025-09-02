# Cloudinary Setup Guide for Fish Market App

This guide will help you set up Cloudinary for automatic image uploads in the Fish Market App admin panel.

## Prerequisites

1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name and create an Upload Preset

## Step 1: Create Cloudinary Account

1. Go to [https://cloudinary.com/](https://cloudinary.com/)
2. Sign up for a free account
3. Verify your email address
4. Log in to your Cloudinary dashboard

## Step 2: Get Your Cloud Name

1. In your Cloudinary dashboard, go to the **Dashboard** tab
2. Find your **Cloud name** (it will be something like `dxxxxx` or a custom name)
3. Copy this value - you'll need it for the `.env` file

## Step 3: Create an Upload Preset

1. In your Cloudinary dashboard, go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure the preset:
   - **Preset name**: Give it a name like `fishmarket_products`
   - **Signing Mode**: Choose **Unsigned** (for client-side uploads)
   - **Folder**: Set to `products` (optional but recommended for organization)
   - **Image and video analysis**: Enable if needed
   - **Image optimization**: 
     - Quality: Auto
     - Format: Auto
     - Fetch format: Auto
   - **Image transformations**: Add any default transformations if needed
5. Click **Save**

## Step 4: Update Environment Variables

1. Open your `.env` file in the project root
2. Add the following lines:

```bash
# Cloudinary Configuration
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_name_here
```

3. Replace the values:
   - `your_cloud_name_here` with your actual Cloudinary cloud name
   - `your_upload_preset_name_here` with the preset name you created

## Example Configuration

Your `.env` file should look like this:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Cloudinary Configuration
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=dxxxxxx
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=fishmarket_products

# Other configurations...
```

## Step 5: Test the Integration

1. Restart your Expo development server:
   ```bash
   npm start
   ```

2. Go to the Admin panel → Products → Add New Product
3. Try adding an image using camera or gallery
4. You should see:
   - "Processing..." while selecting image
   - "Uploading to Cloud..." while uploading to Cloudinary
   - "Success" message when upload completes
   - The Cloudinary URL stored in the database

## Features Included

### Automatic Upload
- Images selected from camera or gallery are automatically uploaded to Cloudinary
- Local images are replaced with Cloudinary URLs before saving to database
- Fallback to local storage if Cloudinary upload fails

### Image Optimization
- Automatic quality optimization
- Format optimization (WebP, AVIF when supported)
- Aspect ratio enforcement (1:1 for product images)
- Image resizing and compression

### Organization
- Images are stored in the `products` folder
- Tagged with `product` and `fishmarket` for easy filtering
- Unique public IDs prevent duplicates

### Error Handling
- Graceful fallback if Cloudinary is unavailable
- User-friendly error messages
- Retry functionality built-in

## Troubleshooting

### Common Issues

1. **"Cloudinary configuration missing" error**
   - Make sure you've added both `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` and `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` to your `.env` file
   - Restart your development server after adding environment variables

2. **"Upload failed" error**
   - Check that your upload preset is set to "Unsigned"
   - Verify your cloud name is correct
   - Check your internet connection

3. **Images not uploading**
   - Ensure you have granted camera and gallery permissions
   - Check the Expo development console for error messages
   - Verify your Cloudinary account limits haven't been exceeded

4. **Environment variables not found**
   - Make sure your `.env` file is in the project root directory
   - Restart Expo development server after making changes
   - Check that variable names start with `EXPO_PUBLIC_`

### Testing the Service

You can test the Cloudinary service directly by importing it in a component:

```typescript
import { cloudinaryService } from '../services/cloudinaryService';

// Test upload
const testUpload = async () => {
  try {
    const url = await cloudinaryService.uploadImage(localImageUri, {
      folder: 'test',
      tags: ['test']
    });
    console.log('Upload successful:', url);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

## Security Notes

- Upload presets are configured as "unsigned" for client-side uploads
- For production, consider implementing server-side signing for additional security
- Monitor your Cloudinary usage to avoid exceeding free tier limits
- Consider implementing image deletion functionality for better storage management

## Free Tier Limits

Cloudinary free tier includes:
- 25 GB storage
- 25 GB monthly bandwidth
- 25,000 images and videos

This should be sufficient for most small to medium applications.

## Next Steps

After setting up Cloudinary:

1. Test image uploads in the admin panel
2. Verify images are appearing in your Cloudinary dashboard
3. Check that Cloudinary URLs are being saved in your Supabase database
4. Consider setting up webhooks for advanced image processing workflows

For more advanced features, check the [Cloudinary documentation](https://cloudinary.com/documentation).

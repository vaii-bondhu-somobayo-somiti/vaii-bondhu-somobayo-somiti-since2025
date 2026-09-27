/**
 * Helper utility to resize and compress uploaded profile images into lightweight JPEG Data URLs.
 * Keeps image sizes under ~20-40KB to avoid exceeding localStorage quotas while maintaining
 * crisp avatar rendering.
 */

export function compressAndReadFile(
  file: File,
  maxWidth: number = 320,
  maxHeight: number = 320,
  quality: number = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('অনুগ্রহ করে একটি ছবি ফাইল (JPG, PNG, WebP) নির্বাচন করুন।'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio scaling
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('ইমেজ প্রসেস করতে ব্যর্থ হয়েছে।'));
          return;
        }

        // Draw image onto canvas with smooth scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to lightweight JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.onerror = () => {
        reject(new Error('ছবি লোড করতে সমস্যা হয়েছে।'));
      };

      if (typeof readerEvent.target?.result === 'string') {
        img.src = readerEvent.target.result;
      } else {
        reject(new Error('ফাইল রিড করা যায়নি।'));
      }
    };

    reader.onerror = () => {
      reject(new Error('ফাইল ওপেন করতে সমস্যা হয়েছে।'));
    };

    reader.readAsDataURL(file);
  });
}

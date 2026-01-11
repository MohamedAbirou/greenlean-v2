/**
 * AvatarUploader Component
 * Allows users to upload and manage their profile picture
 */

import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import imageCompression from 'browser-image-compression';
import { Camera, Loader2, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { UserAvatar } from './ui/UserAvatar';

interface AvatarUploaderProps {
    onAvatarChange?: (url: string | null) => void;
}

export function AvatarUploader({ onAvatarChange }: AvatarUploaderProps) {
    const { user, profile } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB before compression)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        setUploading(true);

        try {
            // Compress image
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 400,
                useWebWorker: true,
            };

            const compressedFile = await imageCompression(file, options);

            // Generate unique filename
            const fileExt = compressedFile.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Delete old avatar if exists
            if (profile?.avatar_url) {
                const oldPath = profile.avatar_url.split('/').pop();
                if (oldPath) {
                    await supabase.storage.from('avatars').remove([`avatars/${oldPath}`]);
                }
            }

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, compressedFile, {
                    cacheControl: '3600',
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            toast.success('Profile picture updated successfully! 🎉');
            onAvatarChange?.(publicUrl);

            // Trigger a page reload to update avatar everywhere
            window.location.reload();
        } catch (error) {
            console.error('Avatar upload error:', error);
            toast.error('Failed to upload profile picture');
        } finally {
            setUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = async () => {
        if (!user || !profile?.avatar_url) return;

        setDeleting(true);

        try {
            // Delete from storage
            const oldPath = profile.avatar_url.split('/').pop();
            if (oldPath) {
                await supabase.storage.from('avatars').remove([`avatars/${oldPath}`]);
            }

            // Update profile
            const { error } = await supabase
                .from('profiles')
                .update({ avatar_url: null })
                .eq('id', user.id);

            if (error) throw error;

            toast.success('Profile picture removed');
            onAvatarChange?.(null);

            // Trigger a page reload to update avatar everywhere
            window.location.reload();
        } catch (error) {
            console.error('Avatar delete error:', error);
            toast.error('Failed to remove profile picture');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                    <h3 className="font-semibold">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground">Upload a custom avatar</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Avatar Preview */}
                <div className="relative">
                    <UserAvatar
                        src={profile?.avatar_url}
                        frameId={profile?.avatar_frame}
                        size="xl"
                        showFrame={true}
                    />
                    {(uploading || deleting) && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex-1 space-y-2 space-x-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading || deleting}
                    />

                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading || deleting}
                        className="w-full sm:w-auto"
                        variant="outline"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload New Photo
                            </>
                        )}
                    </Button>

                    {profile?.avatar_url && (
                        <Button
                            onClick={handleDelete}
                            disabled={uploading || deleting}
                            variant="danger"
                            className="w-full sm:w-auto "
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Removing...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remove Photo
                                </>
                            )}
                        </Button>
                    )}

                    <p className="text-xs text-muted-foreground mt-2">
                        JPG, PNG or GIF. Max 5MB. Will be resized to 400x400px.
                    </p>
                </div>
            </div>
        </Card>
    );
}
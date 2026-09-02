// resources/js/components/image-upload.tsx
import { IconCamera, IconPhoto, IconTrash } from '@tabler/icons-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ImageUploadProps = {
    value: File | string | null;
    onChange: (file: File) => void;
    onRemove: () => void; // 👈 distinct from onChange
    id?: string;
    name?: string;
    'aria-invalid'?: boolean;
    disabled?: boolean;
    className?: string;
    accept?: string;
    maxSizeMb?: number;
    minDimension?: number;
};

export function ImageUpload({
    value,
    onChange,
    onRemove,
    id,
    name,
    disabled,
    className,
    accept = 'image/png,image/jpeg,image/jpg',
    maxSizeMb = 2,
    minDimension = 800,
    ...props
}: ImageUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [localError, setLocalError] = useState<string | null>(null);

    const previewUrl =
        value instanceof File ? URL.createObjectURL(value) : value;
    const hasImage = !!previewUrl;

    function handleFile(file: File | undefined) {
        setLocalError(null);

        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            setLocalError('Please select an image file.');

            return;
        }

        if (file.size > maxSizeMb * 1024 * 1024) {
            setLocalError(`Image must be under ${maxSizeMb}MB.`);

            return;
        }

        onChange(file);
    }

    function handleBadgeClick() {
        if (hasImage) {
            onRemove();

            if (inputRef.current) {
                inputRef.current.value = '';
            }
        } else {
            console.log('click');
            inputRef.current?.click();
        }
    }

    return (
        <div className={cn('flex flex-col items-center gap-2', className)}>
            <div className="relative h-32 w-32 shrink-0">
                <div
                    className={cn(
                        'flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-muted border-2 border-primary',
                        props['aria-invalid'] && 'ring-2 ring-destructive',
                    )}
                >
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <IconPhoto className="h-8 w-8 text-muted-foreground" />
                    )}
                </div>

                <Button
                    disabled={disabled}
                    variant={hasImage ? 'outline' : 'default'}
                    onClick={handleBadgeClick}
                    aria-label={hasImage ? 'Remove photo' : 'Upload photo'}
                    className={cn(
                        'absolute right-0 bottom-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-background  transition-colors',
                        // hasImage
                        //     ? 'bg-outline text-primary-foreground hover:bg-destructive/90'
                        //     : 'bg-primary text-primary-foreground hover:bg-primary/90',
                        disabled && 'cursor-not-allowed opacity-50',
                    )}
                >
                    {hasImage ? (
                        <IconTrash className="h-3.5 w-3.5" />
                    ) : (
                        <IconCamera className="h-3.5 w-3.5" />
                    )}
                </Button>
            </div>

            <div className="flex flex-col items-center gap-1 text-center">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    onClick={() => inputRef.current?.click()}
                    className="w-fit"
                >
                    Upload new photo
                </Button>
                <p className="text-xs text-muted-foreground">
                    At least {minDimension}×{minDimension} px recommended.
                    <br />
                    JPG or PNG is allowed
                </p>
                {localError && (
                    <span className="text-xs text-destructive">
                        {localError}
                    </span>
                )}
            </div>

            <input
                ref={inputRef}
                id={id}
                name={name}
                type="file"
                accept={accept}
                disabled={disabled}
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
            />
        </div>
    );
}

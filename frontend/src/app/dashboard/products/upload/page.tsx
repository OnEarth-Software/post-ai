"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CloudUpload, Camera, ArrowRight, Loader2 } from 'lucide-react';
import styles from './upload.module.css';

export default function UploadProductPage() {
    const router = useRouter();
    const [productName, setProductName] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    };

    const handleFileSelection = (file: File) => {
        if (file.type.startsWith('image/')) {
            setSelectedImage(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            alert('Please select an image file (JPG, PNG).');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productName || !selectedImage) return;

        setIsSubmitting(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const token = localStorage.getItem('token');

            const formData = new FormData();
            formData.append('name', productName);
            formData.append('file', selectedImage);

            const response = await fetch(`${apiUrl}/products/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const responseData = await response.json();
                // Başarılı olduğunda ürün detay sayfasına yönlendir
                router.push(`/dashboard/products/${responseData.id}`);
            } else {
                const errorData = await response.json();
                alert('Yükleme başarısız: ' + (errorData.detail || 'Bilinmeyen bir hata oluştu.'));
                setIsSubmitting(false); // Hata durumunda animasyonu durdur
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Yükleme sırasında bir ağ hatası oluştu.');
            setIsSubmitting(false); // Hata durumunda animasyonu durdur
        }
    };

    return (
        <div className={styles.pageWrapper}>
            {/* The Animated Mesh & Noise Background */}
            <div className={styles.fluidBackground}></div>
            <div className={styles.noiseOverlay}></div>

            <div className={styles.contentWrapper}>

                <div className={styles.glassPanel}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Add New Product</h1>
                        <p className={styles.subtitle}>Bring your next great idea to life with AdDesign AI.</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

                        {/* Borderless Input */}
                        <div className={styles.inputGroup}>
                            <input
                                type="text"
                                className={styles.borderlessInput}
                                placeholder="Enter product name..."
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                required
                            />
                            <div className={styles.inputLine}></div>
                        </div>

                        {/* Magic Dropzone or Preview */}
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className={styles.hiddenInput}
                            />

                            {!previewUrl ? (
                                <div
                                    className={`${styles.magicDropzone} ${isDragging ? styles.active : ''}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className={styles.uploadIconWrapper}>
                                        <CloudUpload size={36} />
                                    </div>
                                    <h4 className={styles.dropzoneTitle}>Drop your masterpiece here</h4>
                                    <p className={styles.dropzoneDesc}>or click to browse from your device</p>
                                </div>
                            ) : (
                                <div className={styles.previewContainer}>
                                    <img src={previewUrl} alt="Product preview" className={styles.previewImage} />

                                    {isSubmitting ? (
                                        <div className={styles.uploadingOverlay}>
                                            <div className={styles.scannerLine}></div>
                                            <div className={styles.uploadingText}>
                                                <CloudUpload className={styles.uploadingIcon} size={32} />
                                                <span>Analyzing with AdDesign AI...</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={styles.previewOverlay}>
                                            <button
                                                type="button"
                                                className={styles.changeImageBtn}
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Camera size={20} />
                                                Change Photo
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Floating Submit Button */}
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={!productName || !selectedImage || isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={24} className={styles.spin} />
                                </>
                            ) : (
                                <>
                                    Upload & Analyze
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

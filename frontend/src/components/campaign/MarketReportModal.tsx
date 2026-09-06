import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { X, Download, FileText } from 'lucide-react';
import Image from 'next/image';
import styles from './MarketReportModal.module.css';

interface MarketReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaign: any;
    brand: any;
}

export default function MarketReportModal({ isOpen, onClose, campaign, brand }: MarketReportModalProps) {
    const reportRef = useRef<HTMLDivElement>(null);

    if (!isOpen || !campaign) return null;

    const handleDownloadPDF = () => {
        const originalTitle = document.title;
        document.title = 'AdDesign AI - Rakip Analizi';
        window.print();
        document.title = originalTitle;
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
                <div className={styles.modalHeader}>
                    <div className={styles.headerTitle}>
                        <FileText size={20} />
                        <h2>Rakip Analizi Raporu</h2>
                    </div>
                    <div className={styles.headerActions}>
                        <button onClick={handleDownloadPDF} className={styles.downloadButton}>
                            <Download size={16} /> PDF İndir
                        </button>
                        <button onClick={onClose} className={styles.closeButton}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.a4PageWrapper}>
                        <div className={styles.a4Page} ref={reportRef}>
                            {/* A4 Header: Brand Info */}
                            <div className={styles.reportHeader}>
                                {brand?.logo_url && (
                                    <div className={styles.brandLogo}>
                                        <Image src={brand.logo_url} alt={brand.name || 'Brand Logo'} fill style={{ objectFit: 'contain' }} />
                                    </div>
                                )}
                                <div className={styles.brandInfo}>
                                    <h1>{brand?.name || 'Marka Belirtilmedi'}</h1>
                                    <p>{brand?.description || 'Bu kampanya için marka seçimi yapılmamış veya marka açıklaması bulunmuyor.'}</p>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className={styles.productSection}>
                                <div className={styles.productInfoBox}>
                                    <h3>{campaign.product?.name || 'Ürün Adı'}</h3>
                                    <div className={styles.productDetails}>
                                        <p><strong>Platform:</strong> {campaign.platform}</p>
                                        <p><strong>Hedef:</strong> {campaign.goal}</p>
                                    </div>
                                </div>
                                {campaign.product?.image_url && (
                                    <div className={styles.productImage}>
                                        <Image src={campaign.product.image_url} alt="Product" fill style={{ objectFit: 'contain', borderRadius: '8px' }} />
                                    </div>
                                )}
                            </div>

                            {/* Campaign Design Image (If available) */}
                            {campaign.results && campaign.results.length > 0 && campaign.results[0].image_url && (
                                <div className={styles.campaignDesignSection}>
                                    <h3>Üretilen Kampanya Görseli</h3>
                                    <div className={styles.campaignDesignImage}>
                                        <Image src={campaign.results[0].image_url} alt="Campaign Design" fill style={{ objectFit: 'contain', borderRadius: '8px' }} />
                                    </div>
                                </div>
                            )}

                            {/* AI Report Markdown */}
                            <div className={styles.markdownContent}>
                                {campaign.market_report ? (
                                    <ReactMarkdown>{campaign.market_report}</ReactMarkdown>
                                ) : (
                                    <p>Rapor içeriği bulunamadı.</p>
                                )}
                            </div>

                            <div className={styles.reportFooter}>
                                <p>Ad-DesignAI Stüdyosu tarafından üretilmiştir.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

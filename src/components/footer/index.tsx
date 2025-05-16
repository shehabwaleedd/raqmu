'use client'
import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { PrismicNextLink } from '@prismicio/next'
import Link from 'next/link'
import styles from './style.module.scss'
import { FiInstagram, FiFacebook, FiLinkedin } from "react-icons/fi"
import { FooterProps } from '@/types/common';

const Footer: React.FC<FooterProps> = ({ settings }) => {
    const [showCredits, setShowCredits] = useState(false)

    const getSocialIcon = (label: string) => {
        switch (label.toLowerCase()) {
            case 'instagram':
                return <FiInstagram />;
            case 'facebook':
                return <FiFacebook />;
            case 'linkedin':
                return <FiLinkedin />;
            default:
                return null;
        }
    };

    const email = settings.contact_information.find(info => info.type === 'email')?.value || '';
    const phone = settings.contact_information.find(info => info.type === 'phone')?.value || '';

    return (
        <footer className={styles.footer}>
            <div className={styles.topSection}>
                <div className={styles.leftColumn}>
                    <Image src={settings.footer_logo.url} alt={settings.footer_logo.alt} width={150} height={150} className={styles.logo}/>
                    <h3>{settings.footer_tagline}</h3>

                    <div className={styles.infoSection}>
                        <div className={styles.connectBlock}>
                            <h3>Connect With Us</h3>
                            <div className={styles.contactLinks}>
                                <a href={`mailto:${email}`} className={styles.emailLink}>
                                    {email}
                                </a>
                                <a href={`tel:${phone}`} className={styles.phoneLink}>
                                    {phone}
                                </a>
                            </div>
                        </div>

                        <div className={styles.addressBlock}>
                            <h3>Visit Our Office</h3>
                            <address>
                                {settings.contact_information
                                    .filter(info => info.type === 'address')
                                    .map((line, index) => (
                                        <span key={index} className={styles.addressLine}>
                                            {line.value}
                                        </span>
                                    ))}
                            </address>
                        </div>

                        <div className={styles.socialBlock}>
                            <h3>Follow Us</h3>
                            <div className={styles.socialLinks}>
                                {settings.social_links.map((social, index) => (
                                    <PrismicNextLink
                                        key={index}
                                        field={{ link_type: 'Web', url: social.url.url }}
                                        target={social.url.target || '_blank'}
                                        rel="noopener noreferrer"
                                        aria-label={social.label}
                                        className={styles.socialLink}
                                    >
                                        {getSocialIcon(social.label)}
                                    </PrismicNextLink>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                <div className={styles.mapWrapper}>
                    <Image
                        src={settings.footer_map.url}
                        alt={settings.footer_map.alt}
                        width={1600}
                        height={900}
                        className={styles.map}
                        priority
                    />
                    <div className={styles.mapOverlay} />
                </div>
            </div>

            <div className={styles.bottomSection}>
                <div className={styles.copyright}>
                    <p> © {new Date().getFullYear()} Sky. All Rights Reserved</p>
                    <nav className={styles.legalNav}>
                        {settings.footer_legal_links.map((link, index) => (
                            <PrismicNextLink key={index}field={{ link_type: 'Web', url: link.url }}className={styles.legalLink}>
                                {link.label}
                            </PrismicNextLink>
                        ))}
                    </nav>
                </div>
                <div className={styles.credits}>
                    Website by{' '}
                    <Link href="https://cairo-studio.com" target="_blank"  aria-label="Visit Cairo Studio - Professional Web Design & Development" title="Cairo Studio - Expert Web Design & Development" prefetch={true}>
                        Cairo Studio
                    </Link>
                </div>
            </div>
        </footer>
    )
}

export default Footer
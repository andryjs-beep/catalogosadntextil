'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { ISocialLinks } from '@/lib/models/Tenant';

interface Collection {
    _id: string;
    name: string;
    slug: string;
}

interface HeaderProps {
    logo: string;
    headerText: string;
    socialLinks?: ISocialLinks;
    tenantSlug: string;
    collections?: Collection[];
}

export function Header({
    logo,
    headerText,
    tenantSlug,
    collections = []
}: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Filtrado de productos y colecciones en el DOM (Real-time)
    useEffect(() => {
        const items = document.querySelectorAll('.product-card, .collection-card');
        items.forEach((item) => {
            const titleElement = item.querySelector('h3');
            if (!titleElement) return;

            const title = titleElement.innerText.toLowerCase();
            const matches = title.includes(searchQuery.toLowerCase());

            (item as HTMLElement).style.display = matches ? '' : 'none';
        });
    }, [searchQuery]);

    // Bloquear scroll cuando el menú está abierto
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isMenuOpen]);

    return (
        <div className="fixed-nav-wrapper">
            <style jsx>{`
                .fixed-nav-wrapper {
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    background: var(--color-header-bg);
                }
                header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 15px;
                    height: 60px;
                    box-sizing: border-box;
                    max-width: 1400px;
                    margin: 0 auto;
                }
                .header-left, .header-right {
                    display: flex;
                    align-items: center;
                    flex: 1;
                }
                .header-center {
                    flex: 2;
                    display: flex;
                    justify-content: center;
                }
                .header-right {
                    justify-content: flex-end;
                    gap: 15px;
                }
                .icon-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 5px;
                    display: flex;
                    align-items: center;
                    color: var(--color-header-text);
                    transition: opacity 0.2s;
                }
                .icon-btn:hover { opacity: 0.7; }
                .icon-btn svg {
                    width: 24px;
                    height: 24px;
                    fill: currentColor;
                }
                #logo-img {
                    max-height: 36px;
                    width: auto;
                    object-fit: contain;
                }
                .logo-text {
                    font-weight: 900;
                    font-size: 20px;
                    letter-spacing: -1px;
                    text-transform: uppercase;
                    color: var(--color-header-text);
                }

                /* BUSCADOR */
                #search-panel {
                    background-color: var(--color-search-bg);
                    padding: 15px;
                    border-bottom: 1px solid var(--color-search-border);
                    position: absolute;
                    width: 100%;
                    left: 0;
                    top: 60px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    display: ${isSearchOpen ? 'block' : 'none'};
                    animation: slideIn 0.3s ease-out;
                }
                @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .search-container {
                    display: flex;
                    gap: 8px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .search-container input {
                    flex: 1;
                    padding: 12px 15px;
                    border: 1px solid var(--color-search-border);
                    border-radius: 8px;
                    font-size: 14px;
                    outline: none;
                    background: #fcfcfc;
                }
                .search-container button {
                    background-color: var(--color-primary);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 700;
                    cursor: pointer;
                }

                /* SIDEBAR NAV */
                nav {
                    position: fixed;
                    top: 0;
                    left: ${isMenuOpen ? '0' : '-320px'};
                    width: 300px;
                    height: 100%;
                    background-color: #ffffff;
                    z-index: 2005;
                    transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 5px 0 25px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                }
                .nav-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.6);
                    display: ${isMenuOpen ? 'block' : 'none'};
                    z-index: 2000;
                    backdrop-filter: blur(2px);
                }
                .nav-header {
                    padding: 20px;
                    background: var(--color-header-bg);
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                nav ul { list-style: none; padding: 20px 0; margin: 0; overflow-y: auto; }
                nav ul li { margin-bottom: 10px; padding: 0 15px; }
                nav ul li a {
                    display: block;
                    padding: 14px 20px;
                    text-decoration: none;
                    color: white;
                    background-color: var(--color-primary);
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 14px;
                    text-align: center;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                }
                nav ul li a:hover { 
                    background-color: var(--color-secondary);
                    color: #000;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(0,0,0,0.1);
                }

                @media (min-width: 768px) {
                    header { padding: 15px 40px; height: 80px; }
                    #search-panel { top: 80px; }
                    #logo-img { max-height: 45px; }
                }
            `}</style>

            <header>
                <div className="header-left">
                    <button className="icon-btn" onClick={() => setIsMenuOpen(true)}>
                        <svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>
                    </button>
                </div>
                <div className="header-center">
                    <Link href={`/t/${tenantSlug}`}>
                        {logo ? (
                            <img id="logo-img" src={logo} alt={headerText} />
                        ) : (
                            <span className="logo-text">{headerText}</span>
                        )}
                    </Link>
                </div>
                <div className="header-right">
                    <button className="icon-btn" onClick={() => setIsSearchOpen(!isSearchOpen)}>
                        <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
                    </button>
                </div>

                <div id="search-panel">
                    <div className="search-container">
                        <input
                            type="search"
                            placeholder="Buscar productos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                        <button onClick={() => setIsSearchOpen(false)}>Listo</button>
                    </div>
                </div>
            </header>

            <div className="nav-overlay" onClick={() => setIsMenuOpen(false)}></div>
            <nav>
                <div className="nav-header">
                    <span style={{ fontWeight: 800, letterSpacing: '1px' }}>MENÚ</span>
                    <span style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => setIsMenuOpen(false)}>×</span>
                </div>
                <ul>
                    <li><Link href={`/t/${tenantSlug}`} onClick={() => setIsMenuOpen(false)}>INICIO</Link></li>
                    {/* CATEGORÍAS REALES DEL CATÁLOGO */}
                    {collections.map(col => (
                        <li key={col._id}>
                            <Link href={`/t/${tenantSlug}/${col.slug}`} onClick={() => setIsMenuOpen(false)}>
                                {col.name.toUpperCase()}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}

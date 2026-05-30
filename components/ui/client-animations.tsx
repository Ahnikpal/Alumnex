"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ClientAnimations() {
    const pathname = usePathname();

    useEffect(() => {
        // 1. Reveal on Scroll (Optimized with class-only triggers and will-change)
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target as HTMLElement;
                    const delay = parseInt(el.getAttribute("data-delay") || "0");
                    
                    // Hint GPU for smoother transition
                    el.style.willChange = 'opacity, transform';
                    
                    setTimeout(() => {
                        el.classList.add("revealed");
                        // Clean up will-change after animation to save GPU memory
                        setTimeout(() => {
                            el.style.willChange = 'auto';
                        }, 1000);
                    }, delay);
                    revealObserver.unobserve(el);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        document.querySelectorAll('.reveal-on-scroll:not(.revealed)').forEach((el, index) => {
            const htmlEl = el as HTMLElement;
            if (!htmlEl.hasAttribute('data-delay')) {
                htmlEl.setAttribute("data-delay", (index * 50).toString()); // Reduced delay for snappier feel
            }
            revealObserver.observe(htmlEl);
        });

        // 2. Ripple Effects
        const handleRipple = (event: Event) => {
            const e = event as MouseEvent;
            const button = e.currentTarget as HTMLElement;
            if ((button as HTMLButtonElement).disabled || button.style.pointerEvents === 'none') return;

            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                pointer-events: none;
            `;

            button.appendChild(ripple);
            setTimeout(() => {
                ripple.remove();
            }, 600);
        };

        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-apply, .btn-submit, .btn-primary-small, button');
        buttons.forEach(button => {
            const htmlBtn = button as HTMLElement;
            if (htmlBtn.classList.contains("sidebar-toggle") || htmlBtn.classList.contains("psw-toggle")) return; // excluding sidebar toggles and password toggles
            htmlBtn.style.position = 'relative';
            htmlBtn.style.overflow = 'hidden';
            htmlBtn.removeEventListener('click', handleRipple); // Ensure no dupe
            htmlBtn.addEventListener('click', handleRipple);
        });

        // Add ripple animation keyframes globally if missing
        if (!document.getElementById('ripple-keyframes')) {
            const style = document.createElement('style');
            style.id = 'ripple-keyframes';
            style.textContent = `
                @keyframes ripple-animation {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // 3. Floating Blobs (only run once globally if not exists)
        if (!document.querySelector('.floating-blob-container')) {
            const blobContainer = document.createElement('div');
            blobContainer.className = 'floating-blob-container';
            blobContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
                pointer-events: none;
                overflow: hidden;
            `;
            for (let i = 1; i <= 5; i++) {
                const blob = document.createElement('div');
                blob.className = `floating-blob blob-${i}`;
                blobContainer.appendChild(blob);
            }
            document.body.insertBefore(blobContainer, document.body.firstChild);
        }

        // 4. Throttled Mouse Move Glow for Performance
        let rafId: number | null = null;
        const handleMouseMove = (event: Event) => {
            if (rafId) return; // Already scheduled

            const element = event.currentTarget as HTMLElement;
            if (!element) return;

            rafId = requestAnimationFrame(() => {
                const e = event as MouseEvent;
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                element.style.setProperty('--mouse-x', `${x}px`);
                element.style.setProperty('--mouse-y', `${y}px`);
                rafId = null;
            });
        };

        const handleMouseLeave = (event: Event) => {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            const e = event as MouseEvent;
            const element = e.currentTarget as HTMLElement;
            element.style.setProperty('--mouse-x', '0px');
            element.style.setProperty('--mouse-y', '0px');
        };

        const cards = document.querySelectorAll('button, a, .card, input, textarea, select, .feature-card, .internship-card, .stat-card, .profile-card, .application-card');
        cards.forEach(el => {
            const htmlEl = el as HTMLElement;
            if (!htmlEl.classList.contains("sidebar-link")) {
                htmlEl.classList.add('glow-btn');
                // Ensure GPU layering for mouse-glow container
                htmlEl.style.willChange = 'transform, background';
            }
            htmlEl.removeEventListener('mousemove', handleMouseMove);
            htmlEl.removeEventListener('mouseleave', handleMouseLeave);
            htmlEl.addEventListener('mousemove', handleMouseMove);
            htmlEl.addEventListener('mouseleave', handleMouseLeave);
        });

        return () => {
            revealObserver.disconnect();
            buttons.forEach(button => button.removeEventListener('click', handleRipple));
            cards.forEach(el => {
                el.removeEventListener('mousemove', handleMouseMove);
                el.removeEventListener('mouseleave', handleMouseLeave);
            });
        };

    }, [pathname]);

    return null;
}

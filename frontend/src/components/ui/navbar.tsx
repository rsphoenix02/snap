'use client'
import Link from 'next/link'
import { Equal, X, Zap } from 'lucide-react'
import { Button } from '@/components/ui/liquid-glass-button'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const menuItems = [
    { name: 'Features', target: 'features' },
    { name: 'Stats', target: 'stats' },
]

export const Header = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        handleScroll()
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close mobile menu on resize to desktop
    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setMenuState(false)
        }
        window.addEventListener('resize', handleResize, { passive: true })
        return () => window.removeEventListener('resize', handleResize)
    }, [])


    return (
        <header>
            <nav className="fixed left-0 w-full z-20 px-2 flex justify-center pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{
                        opacity: mounted ? 1 : 0,
                        y: mounted ? 0 : -20,
                        maxWidth: menuState ? 1280 : isScrolled ? 720 : 1280,
                        borderRadius: menuState ? 20 : isScrolled ? 9999 : 0,
                        paddingTop: isScrolled ? 8 : 8,
                        paddingBottom: isScrolled ? 8 : 8,
                        paddingLeft: isScrolled ? 20 : 24,
                        paddingRight: isScrolled ? 20 : 24,
                        marginTop: isScrolled ? 16 : 8,
                    }}
                    transition={{
                        opacity: { duration: 0.5, ease: 'easeOut', delay: mounted && !isScrolled ? 0.2 : 0 },
                        y: { duration: 0.5, ease: 'easeOut', delay: mounted && !isScrolled ? 0.2 : 0 },
                        maxWidth: menuState ? { duration: 0 } : { type: 'spring', stiffness: 180, damping: 28 },
                        borderRadius: menuState ? { duration: 0 } : { type: 'spring', stiffness: 180, damping: 28 },
                        default: { type: 'spring', stiffness: 180, damping: 28 },
                    }}
                    style={{
                        width: '100%',
                        background: isScrolled || menuState ? 'rgba(10, 10, 10, 0.7)' : 'transparent',
                        backdropFilter: isScrolled || menuState ? 'blur(24px)' : 'blur(0px)',
                        WebkitBackdropFilter: isScrolled || menuState ? 'blur(24px)' : 'blur(0px)',
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderColor: isScrolled || menuState ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                        transition: 'background 0.5s ease, backdrop-filter 0.5s ease, -webkit-backdrop-filter 0.5s ease, border-color 0.5s ease',
                    }}
                    className="relative flex flex-wrap items-center pointer-events-auto"
                >
                    {/* Logo */}
                    <div className="flex items-center gap-2 min-w-[80px]">
                        <Zap className="size-5 text-red-500 fill-red-500" />
                        <span className="font-semibold text-lg tracking-tighter text-white whitespace-nowrap">SNAP</span>
                    </div>

                    {/* Nav links — desktop: absolutely centered */}
                    <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                        {menuItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth' })
                                }}
                                className="text-zinc-400 text-sm hover:text-white transition-colors duration-300 whitespace-nowrap cursor-pointer">
                                {item.name}
                            </button>
                        ))}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMenuState(!menuState)}
                        aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                        className="lg:hidden ml-auto mr-3 p-2 text-zinc-400 hover:text-white transition-colors relative z-20">
                        <AnimatePresence mode="wait" initial={false}>
                            {menuState ? (
                                <motion.div
                                    key="close"
                                    initial={{ opacity: 0, rotate: -90 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: 90 }}
                                    transition={{ duration: 0.2 }}>
                                    <X className="size-5" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="menu"
                                    initial={{ opacity: 0, rotate: 90 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: -90 }}
                                    transition={{ duration: 0.2 }}>
                                    <Equal className="size-5" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>

                    {/* CTA — pushed to far right */}
                    <div className="lg:ml-auto hidden lg:flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href="#">
                                <span>Login</span>
                            </Link>
                        </Button>
                        <Button asChild size="sm">
                            <Link href="#">
                                <span>Sign Up</span>
                            </Link>
                        </Button>
                    </div>

                    {/* Mobile dropdown menu */}
                    <AnimatePresence>
                        {menuState && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="lg:hidden w-full overflow-hidden">
                                <div className="flex flex-col gap-1 pt-4 pb-2 border-t border-white/[0.06] mt-3">
                                    {menuItems.map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -12 }}
                                            transition={{ delay: i * 0.05, type: 'spring', stiffness: 200, damping: 20 }}>
                                            <button
                                                onClick={() => {
                                                    setMenuState(false)
                                                    setTimeout(() => {
                                                        document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth' })
                                                    }, 150)
                                                }}
                                                className="text-zinc-400 text-sm py-2.5 px-2 rounded-lg hover:text-white hover:bg-white/[0.04] transition-colors duration-200 block w-full text-left cursor-pointer">
                                                {item.name}
                                            </button>
                                        </motion.div>
                                    ))}
                                    <motion.div
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -12 }}
                                        transition={{ delay: menuItems.length * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
                                        className="flex flex-col gap-2 pt-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href="#">
                                                <span>Login</span>
                                            </Link>
                                        </Button>
                                        <Button asChild size="sm">
                                            <Link href="#">
                                                <span>Sign Up</span>
                                            </Link>
                                        </Button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </nav>
        </header>
    )
}

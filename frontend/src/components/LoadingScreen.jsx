import { motion } from 'framer-motion';
import logo from '../assets/logo.jpg';

export default function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div className="relative flex flex-col items-center">
        {/* Ambient Glow */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute h-48 w-48 rounded-full bg-green-100 blur-3xl"
        />
        
        {/* Logo Container with Unique Animation */}
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          {/* External Rotating Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 border border-dashed border-green-200 rounded-full"
          />
          
          {/* Inner Rotating Border */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-2 border-2 border-green-500/30 rounded-2xl"
          />

          {/* Logo with Bounce/Pulse */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative h-20 w-20 overflow-hidden rounded-3xl shadow-[0_20px_50px_rgba(34,197,94,0.15)] bg-white border border-slate-100 flex items-center justify-center"
          >
            <img src={logo} alt="FARM Logo" className="h-full w-full object-contain p-2" />
          </motion.div>
        </motion.div>

        {/* Brand Text */}
        <div className="mt-12 flex flex-col items-center gap-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <span 
              className="text-3xl font-black tracking-tighter bg-gradient-to-r from-green-700 to-emerald-500 bg-clip-text text-transparent"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Farm
            </span>
          </motion.div>
          
          {/* Modern Progress Bar (Indeterminate) */}
          <div className="w-40 h-1 bg-slate-100 rounded-full overflow-hidden mt-2 relative">
            <motion.div
              animate={{
                x: [-160, 160],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-green-500 to-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

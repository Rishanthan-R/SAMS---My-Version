import { Phone, Mail, Sparkles } from 'lucide-react';

export function ProfileCard() {
  return (
    <div className="relative rounded-[2rem] overflow-hidden bg-[#e0eff0] h-[340px] shadow-sm flex flex-col justify-end p-5">
      {/* Background Image/Gradient could go here. For now, solid color + image on top */}
      <div className="absolute inset-0 w-full h-full">
        {/* Placeholder for the person image. The image shows a guy in a white shirt. */}
        <img 
          src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
          alt="Chris Jonathan" 
          className="w-full h-full object-cover object-top opacity-90 mix-blend-multiply"
        />
      </div>
      
      {/* Top Pill */}
      <div className="absolute top-5 left-5 bg-black/80 backdrop-blur-md text-white text-xs font-medium px-4 py-2 rounded-full flex items-center gap-1.5 shadow-lg">
        4+ years experience
        <Sparkles className="w-3 h-3 text-yellow-300" />
      </div>
      
      {/* Bottom Info Card */}
      <div className="relative z-10 bg-black/20 backdrop-blur-lg border border-white/20 rounded-[1.5rem] p-4 flex items-center justify-between shadow-xl">
        <div className="text-white">
          <h3 className="font-semibold text-lg leading-tight">Chris Jonathan</h3>
          <p className="text-white/80 text-sm font-light">General manager</p>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-colors shadow-sm">
            <Phone className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-900 transition-colors shadow-sm">
            <Mail className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

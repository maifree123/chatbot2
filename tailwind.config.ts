import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
		animation: {
			in: "in 0.35s ease-in",
			"fade-in": "fade-in 0.3s ease-out",
			"slide-in": "slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
		  },
		  keyframes: {
			in: {
			  "0%": { 
				opacity: "0",
				transform: "translateX(-1rem)" 
			  },
			  "100%": { 
				opacity: "1",
				transform: "translateX(0)" 
			  }
			},
			// 添加更多动画
			"fade-in": {
			  "0%": { opacity: "0" },
			  "100%": { opacity: "1" }
			},
			"slide-in": {
			  "0%": { transform: "translateY(1rem)" },
			  "100%": { transform: "translateY(0)" }
			}
		  },
		fontFamily: {
			sans: ["var(--font-sans)", "sans-serif"],      // 默认无衬线字体（用于正文）
			serif: ["var(--font-serif)", "serif"],         // 衬线字体（用于标题）
			mono: ["var(--font-mono)", "monospace"],       // 等宽字体（用于代码）
			handwritten: ["var(--font-handwritten)", "cursive"] // 手写字体（装饰文本）
		  },
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  
  plugins: [require('@tailwindcss/typography'),],
} satisfies Config;

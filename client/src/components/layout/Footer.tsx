import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import IncentEdgeLogo from "@/assets/icons/IncentEdgeLogo";
import { MapPin, Phone, Mail, Linkedin, Twitter, Facebook } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <IncentEdgeLogo className="h-16 text-primary-400" />
            </div>
            <p className="text-neutral-400 text-sm">
              Helping property owners and developers navigate and leverage sustainable building incentives across NYC, NYS, and Westchester.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition">
                <Linkedin size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition">
                <Twitter size={20} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition">
                <Facebook size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-neutral-400 hover:text-white text-sm transition">Home</Link></li>
              <li><Link href="/about" className="text-neutral-400 hover:text-white text-sm transition">About Us</Link></li>
              <li><Link href="/incentives" className="text-neutral-400 hover:text-white text-sm transition">Incentive Database</Link></li>
              <li><Link href="/calculator" className="text-neutral-400 hover:text-white text-sm transition">Calculator</Link></li>
              <li><Link href="/resources" className="text-neutral-400 hover:text-white text-sm transition">Success Stories</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/resources#updates" className="text-neutral-400 hover:text-white text-sm transition">Incentive Updates</Link></li>
              <li><Link href="/resources#guides" className="text-neutral-400 hover:text-white text-sm transition">Application Guides</Link></li>
              <li><Link href="/resources#case-studies" className="text-neutral-400 hover:text-white text-sm transition">Case Studies</Link></li>
              <li><Link href="/resources#faq" className="text-neutral-400 hover:text-white text-sm transition">FAQ</Link></li>
              <li><Link href="/resources#blog" className="text-neutral-400 hover:text-white text-sm transition">Blog</Link></li>
              <li><Link href="/resources#webinars" className="text-neutral-400 hover:text-white text-sm transition">Webinars</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="text-neutral-400 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
                <span className="text-neutral-400 text-sm">350 5th Avenue, New York, NY 10118</span>
              </li>
              <li className="flex items-start">
                <Phone className="text-neutral-400 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
                <span className="text-neutral-400 text-sm">(212) 555-0123</span>
              </li>
              <li className="flex items-start">
                <Mail className="text-neutral-400 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
                <span className="text-neutral-400 text-sm">info@incentedge.com</span>
              </li>
            </ul>
            <div className="mt-6">
              <Button asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm">
            &copy; {currentYear} IncentEdge. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <Link href="/privacy" className="text-neutral-400 hover:text-white text-sm mr-4 transition">Privacy Policy</Link>
            <Link href="/terms" className="text-neutral-400 hover:text-white text-sm mr-4 transition">Terms of Service</Link>
            <Link href="/cookies" className="text-neutral-400 hover:text-white text-sm transition">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

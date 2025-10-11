
import Link from 'next/link';
import Image from 'next/image';

export const Logo = () => (
    <Link href="/" className="inline-block">
        <Image 
            src="https://i.imgur.com/blBpKxs.png" 
            alt="Pet Estrela Crematório Logo" 
            width={140} 
            height={40} 
            className="block drop-shadow-sm" 
            priority 
        />
    </Link>
);

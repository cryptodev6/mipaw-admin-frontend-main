"use client";
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from "next/navigation";

export default function Header(){
	const current_path = usePathname();
	return (
		<header>
			<div className="container">
				<div className="wrap">
					<div className="logo">
						Welcome User
					</div>
				</div>
			</div>
		</header>
	);
}
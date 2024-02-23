"use client";
import Link from 'next/link';
import { usePathname } from "next/navigation";

export default function Sidebar(){
	const current_path = usePathname();
	return (

		<aside className="dashboard-sidebar">
			<div className="dashboard-logo">
				<a href="#">Dashboard Logo</a>
			</div>
			<ul>
				<li className={`${current_path==="/dashboard" ? "active": ""} have-submenu`}>
					<Link href="/dashboard">Home</Link>
					<ul>
						<li className={`${current_path==="/dashboard" ? "active": ""}`}>
							<Link href="/dashboard">Home</Link>
						</li>
						<li className={`${current_path==="/dashboard" ? "active": ""}`}>
							<Link href="/dashboard">Home</Link>
						</li>
						<li className={`${current_path==="/dashboard" ? "active": ""}`}>
							<Link href="/dashboard">Home</Link>
						</li>
					</ul>
				</li>
				<li className={`${current_path==="/dashboard/employees" ? "active": ""}`}>
					<Link href="/dashboard/employees">Employees</Link>
				</li>
				<li>
					<Link href="/logout">Logout</Link>
				</li>
			</ul>
		</aside>
	);
}
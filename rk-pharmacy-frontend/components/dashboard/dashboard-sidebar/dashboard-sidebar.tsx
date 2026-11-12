'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  BriefcaseBusiness,
  Check,
  ChevronDown,
  FileChartColumn,
  Home,
  NotebookText,
  Plus,
  Settings,
  SquarePlus,
  UserCog,
} from 'lucide-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar'

export function DashboardSidebar() {
  const pathname = usePathname()

  const navItems = [
    // {
    //   title: 'Dashboard Overview',
    //   icon: Home,
    //   href: '/dashboard/dashboard-overview',
    // },
    {
      title: 'Categories',
      icon: Plus,
      href: '/dashboard/categories',
    },
    {
      title: 'Products',
      icon: BriefcaseBusiness,
      href: '/dashboard/products',
    },
    {
      title: 'Orders To Confirm',
      icon: FileChartColumn,
      href: '/dashboard/orders-to-confirm',
    },
    {
      title: 'Confirmed Orders',
      icon: Check,
      href: '/dashboard/confirmed-orders',
    },
    // {
    //   title: 'Users',
    //   icon: UserCog,
    //   href: '/dashboard/users',
    // },
  ]

  // Check if the current path is in the submenu items
  const isSubItemActive = (item: any) => {
    if (!item.subItems) return false
    return item.subItems.some((subItem: any) => pathname === subItem.href)
  }

  // Check if the current path matches the main item or its sub-items
  const isItemActive = (item: any) => {
    return pathname.startsWith(item.href) || isSubItemActive(item)
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="p-2">
            <h1 className="text-xl font-bold">My Dashboard</h1>
          </div>
          <div>
            <Link href={'/'}>
              <Home />
            </Link>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`${isItemActive(item) ? 'bg-blue-400 text-black hover:bg-blue-400' : ''}  `}
                  >
                    <Link href={item.href}>
                      <item.icon className="mr-2 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import logoUrl from "@assets/Heading (300 x 50 px) (1000 x 250 px) (2)_1762359727994.png";

interface HeaderProps {
  showActions?: boolean;
}

export default function Header({ showActions = true }: HeaderProps) {
  return null;
}

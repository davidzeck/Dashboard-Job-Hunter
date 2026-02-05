"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

// User avatar with fallback to initials
interface UserAvatarProps {
  name: string;
  imageUrl?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

function UserAvatar({ name, imageUrl, className, size = "md" }: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-20 w-20 text-xl",
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={imageUrl} alt={name} />
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
}

// Company avatar/logo
interface CompanyAvatarProps {
  name: string;
  logoUrl?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

function CompanyAvatar({ name, logoUrl, className, size = "md" }: CompanyAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-20 w-20 text-xl",
  };

  return (
    <Avatar className={cn(sizeClasses[size], "rounded-md", className)}>
      <AvatarImage src={logoUrl} alt={name} className="object-contain p-1" />
      <AvatarFallback className="rounded-md bg-primary/10 text-primary font-semibold">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

export { Avatar, AvatarImage, AvatarFallback, UserAvatar, CompanyAvatar };

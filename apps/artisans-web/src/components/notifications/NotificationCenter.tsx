import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// 1. Corregido: Eliminados imports X y ExternalLink que no se usaban
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

const notificationIcons: Record<string, string> = {
  moderation_approve: "✅",
  moderation_reject: "❌",
  moderation_approve_with_edits: "✏️",
  moderation_request_changes: "🔄",
  marketplace_approved: "🏪",
  marketplace_removed: "🚫",
  shop_created: "🎉",
  shop_published: "🚀",
  shop_first_sale: "💰",
  product_created: "📦",
  product_approved: "✅",
  product_low_stock: "⚠️",
  product_out_of_stock: "🔴",
  milestone_completed: "🏆",
  task_completed: "✓",
  achievement_unlocked: "🎖️",
  level_up: "⬆️",
  welcome: "👋",
  profile_completed: "👤",
  bank_data_configured: "💳",
  system_announcement: "📢",
  feature_update: "🆕",
  default: "📬",
};

export const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const [open, setOpen] = useState(false);

  // 2. Corregido: Se eliminó la función getIcon que no se usaba

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    const actionUrl = notification.metadata?.actionUrl;
    if (actionUrl) {
      setOpen(false);
      navigate(actionUrl);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[calc(100vw-2rem)] sm:w-96 max-w-96 p-0"
        align="end"
      >
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold text-sm">Notificaciones</h4>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => markAllAsRead()}
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Marcar</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => {
                setOpen(false);
                navigate("/notifications");
              }}
            >
              Ver todas
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Cargando...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tienes notificaciones</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification, idx) => (
                <div key={notification.id || idx} className="flex flex-col">
                  {idx > 0 && <Separator className="my-1" />}{" "}
                  {/* Ajuste visual opcional */}
                  <NotificationItem
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onMarkAsRead={() => markAsRead(notification.id)}
                    onDelete={() => deleteNotification(notification.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onMarkAsRead: () => void;
  onDelete: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  onMarkAsRead,
  onDelete,
}) => {
  const icon =
    notificationIcons[notification.type] || notificationIcons.default;
  const hasActionUrl = !!notification.metadata?.actionUrl;

  return (
    <div
      className={cn(
        "p-3 hover:bg-muted/50 transition-colors relative group",
        !notification.read && "bg-primary/5",
        hasActionUrl && "cursor-pointer"
      )}
      onClick={hasActionUrl ? onClick : undefined}
    >
      <div className="flex gap-3">
        <span className="text-lg">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm", !notification.read && "font-medium")}>
            {notification.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {/* 4. Protección contra fechas inválidas */}
            {notification.created_at
              ? formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                  locale: es,
                })
              : ""}
          </p>
        </div>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead();
            }}
          >
            <Check className="w-3 h-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      {!notification.read && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r" />
      )}
    </div>
  );
};

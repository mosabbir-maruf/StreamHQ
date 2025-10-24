"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { User, Close } from "@/utils/icons";
import { getAvatarsForUser } from "@/utils/avatar";
import { cn } from "@/utils/helpers";
import { env } from "@/utils/env";

interface AvatarSelectorProps {
  selectedAvatar: string | undefined;
  onAvatarSelect: (avatar: string) => void;
  className?: string;
  userId?: string;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatar,
  onAvatarSelect,
  className,
  userId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const avatars = userId ? getAvatarsForUser(userId, env.NEXT_PUBLIC_ADMIN_USER_ID) : getAvatarsForUser('', env.NEXT_PUBLIC_ADMIN_USER_ID);

  const handleAvatarSelect = (avatar: string) => {
    onAvatarSelect(avatar);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="bordered"
        size="sm"
        onPress={() => setIsOpen(true)}
        className={cn("justify-center text-xs", className)}
      >
        Change Avatar
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        size="2xl"
        scrollBehavior="inside"
        className="mx-2 sm:mx-4"
        classNames={{
          base: "max-w-sm sm:max-w-2xl",
          body: "px-2 sm:px-4"
        }}
      >
        <ModalContent className="max-h-[90vh]">
          <ModalHeader className="sticky top-0 bg-background z-10 flex flex-row items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold">Select Avatar</h3>
            <Button
              isIconOnly
              variant="light"
              onPress={() => setIsOpen(false)}
              className="w-8 h-8"
              size="sm"
            >
              <Close className="text-lg" />
            </Button>
          </ModalHeader>
          <ModalBody className="p-4">
            <ScrollShadow className="max-h-[60vh]">
              {/* Mobile: 3 columns with avatars */}
              <div className="block sm:hidden">
                <div className="grid grid-cols-3 gap-3 justify-items-center">
                  {avatars.map((avatar, index) => (
                    <Button
                      key={index}
                      isIconOnly
                      variant={selectedAvatar === avatar ? "solid" : "light"}
                      color={selectedAvatar === avatar ? "primary" : "default"}
                      onPress={() => handleAvatarSelect(avatar)}
                      className={cn(
                        "w-16 h-16 p-0 transition-all duration-200 hover:scale-105",
                        selectedAvatar === avatar && "ring-3 ring-primary ring-offset-1"
                      )}
                    >
                      <Avatar
                        src={avatar}
                        className="w-full h-full"
                        showFallback
                        fallback={<User className="text-xl" />}
                      />
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Desktop: Original grid layout */}
              <div className="hidden sm:block">
                <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                  {avatars.map((avatar, index) => (
                    <Button
                      key={index}
                      isIconOnly
                      variant={selectedAvatar === avatar ? "solid" : "light"}
                      color={selectedAvatar === avatar ? "primary" : "default"}
                      onPress={() => handleAvatarSelect(avatar)}
                      className={cn(
                        "w-12 h-12 p-0 transition-all duration-200 hover:scale-105",
                        selectedAvatar === avatar && "ring-2 ring-primary ring-offset-2"
                      )}
                    >
                      <Avatar
                        src={avatar}
                        className="w-full h-full"
                        showFallback
                        fallback={<User className="text-lg" />}
                      />
                    </Button>
                  ))}
                </div>
              </div>
            </ScrollShadow>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AvatarSelector;

"use client";

import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ScrollShadow,
  Link,
} from "@heroui/react";
import { ADS_WARNING_STORAGE_KEY, IS_BROWSER } from "@/utils/constants";

const AdsWarning: React.FC = () => {
  const [seen, setSeen] = useLocalStorage<boolean>({
    key: ADS_WARNING_STORAGE_KEY,
    getInitialValueInEffect: false,
  });
  const [opened, handlers] = useDisclosure(!seen && IS_BROWSER);

  const handleSeen = () => {
    handlers.close();
    setSeen(true);
  };

  if (seen) return null;

  return (
    <Modal
      hideCloseButton
      isOpen={opened}
      placement="center"
      backdrop="blur"
      size="md"
      isDismissable={false}
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-center text-xl font-semibold">
          Before you watch
        </ModalHeader>
        <ModalBody>
          <ScrollShadow hideScrollBar className="space-y-3">
            <p className="text-center">
              Some players show their own pop‑up ads. For the cleanest experience, use {" "}
              <Link
                isExternal
                color="warning"
                href="https://adguard-dns.io/en/public-dns.html"
                underline="hover"
                className="font-semibold"
              >
                AdGuard DNS
              </Link>{" "}
              (recommended). You can also use {" "}
              <Link
                isExternal
                color="success"
                href="https://adguard.com/"
                underline="hover"
                className="font-semibold"
              >
                AdGuard
              </Link>{" "}
              (recommended) or the {" "}
              <Link
                isExternal
                color="primary"
                href="https://brave.com/"
                underline="hover"
                className="font-semibold"
              >
                Brave browser
              </Link>
              .
            </p>
            <p className="text-center">
              Video not playing? Open the source menu in the player and try another source.
            </p>
          </ScrollShadow>
        </ModalBody>
        <ModalFooter className="justify-center">
          <Button color="primary" size="sm" variant="flat" onPress={handleSeen}>
            Okay, I understand
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AdsWarning;

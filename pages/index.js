import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const containerRef = useRef(null);
  const [pspdfInstance, setPspdfInstance] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    let PSPDFKit;

    (async function () {
      PSPDFKit = await import('pspdfkit');

      if (PSPDFKit) {
        PSPDFKit.unload(containerRef.current);
      }

      const instance = await PSPDFKit.load({
        container: containerRef.current,
        document: 'https://arxiv.org/pdf/2206.07819.pdf',
        baseUrl: `${window.location.protocol}//${window.location.host}/`,
      });

      setPspdfInstance(instance);
    })();

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      return PSPDFKit && PSPDFKit.unload(containerRef.current);
    };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveToLocal = () => {
    pspdfInstance.exportPDF().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/pdf' });
      const fileName = 'document.pdf';
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, fileName);
      } else {
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.style = 'display: none';
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(objectUrl);
        document.body.removeChild(a);
      }
    });
  };

  const saveToRemoteServer = async () => {
    const arrayBuffer = await pspdfInstance.exportPDF();
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', blob);
    // await fetch('/upload', {
    //   method: 'POST',
    //   body: formData,
    // });
  };

  return (
    <Box px="2rem">
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Text onClick={() => console.log(containerRef.current)}>
        PSPDFKIT NEXT
      </Text>
      <Text>Trying to make pspdf work in chakra UI modal</Text>
      <Text>Make sure to run this code below after npm install</Text>
      <Text>cp -R ./node_modules/pspdfkit/dist/pspdfkit-lib public/pspdfkit-lib</Text>
      <Text>need to copy psdpdfkit-lib from node modules to next public folder</Text>

      <Button onClick={onOpen}>Open Modal (PSDPDF EDITOR)</Button>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="6xl"
        initialFocusRef={containerRef}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text onClick={() => console.log(containerRef.current)}>
              PDF View
            </Text>
            <Box ref={containerRef} height="700px" />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost" onClick={saveToLocal}>
              Save to local
            </Button>
            <Button variant="ghost" onClick={saveToRemoteServer}>
              Save to remote server
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

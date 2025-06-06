
'use client';

import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileKey, AlertCircle, Copy, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import forge from 'node-forge';
import { Badge } from '@/components/ui/badge';

interface CertificateAttribute {
  oid: string;
  name: string;
  shortName?: string;
  value: string;
}

interface ParsedExtension {
  id: string;
  name: string;
  critical: boolean;
  value: any; // Can be complex, will be formatted
  valueString?: string;
}

interface ParsedCertificateDetails {
  subject: CertificateAttribute[];
  issuer: CertificateAttribute[];
  validity: {
    notBefore: string;
    notAfter: string;
  };
  serialNumber: string;
  signatureAlgorithm: string;
  publicKey: {
    algorithm: string;
    details: string; // e.g. RSA 2048 bits, EC prime256v1
    pem?: string;
  };
  extensions: ParsedExtension[];
  fingerprints: {
    sha1: string;
    sha256: string;
  };
  pem: string;
}

const OID_MAP: { [key: string]: string } = {
  '2.5.4.3': 'Common Name (CN)',
  '2.5.4.6': 'Country (C)',
  '2.5.4.10': 'Organization (O)',
  '2.5.4.11': 'Organizational Unit (OU)',
  '2.5.4.7': 'Locality (L)',
  '2.5.4.8': 'State/Province (ST)',
  '2.5.4.9': 'Street Address',
  '2.5.4.5': 'Serial Number (DN)',
  '1.2.840.113549.1.9.1': 'Email Address',
  // Signature Algorithms
  '1.2.840.113549.1.1.11': 'sha256WithRSAEncryption',
  '1.2.840.113549.1.1.5': 'sha1WithRSAEncryption',
  '1.2.840.10045.4.3.2': 'ecdsa-with-SHA256',
  // Public Key Algorithms
  '1.2.840.113549.1.1.1': 'RSA',
  '1.2.840.10045.2.1': 'Elliptic Curve',
  // Extensions
  '2.5.29.15': 'Key Usage',
  '2.5.29.37': 'Extended Key Usage',
  '2.5.29.17': 'Subject Alternative Name (SAN)',
  '2.5.29.19': 'Basic Constraints',
  '2.5.29.31': 'CRL Distribution Points',
  '1.3.6.1.5.5.7.1.1': 'Authority Information Access (AIA)',
  '2.5.29.14': 'Subject Key Identifier',
  '2.5.29.35': 'Authority Key Identifier',
  '2.5.29.32': 'Certificate Policies',
};

const formatAttribute = (attr: any): CertificateAttribute => {
  return {
    oid: attr.oid || 'N/A',
    name: OID_MAP[attr.oid || ''] || attr.name || attr.type || 'Unknown OID',
    shortName: attr.shortName,
    value: String(attr.value),
  };
};

const formatPublicKey = (publicKey: any) => {
  let algorithm = 'Unknown';
  let details = 'N/A';
  if (forge.pki.oids.rsaEncryption === publicKey.type || publicKey.type === OID_MAP['1.2.840.113549.1.1.1']) {
    algorithm = 'RSA';
    details = `${publicKey.n.bitLength()} bits`;
  } else if (forge.pki.oids.ecPublicKey === publicKey.type || publicKey.type === OID_MAP['1.2.840.10045.2.1']) {
    algorithm = 'Elliptic Curve';
    // Attempt to get curve name, might need more specific parsing or OID mapping for curve
    details = `Curve: ${forge.pki.oids[publicKey.curve?.toString() || ''] || 'Unknown'}`;
  }
  
  let pem;
  try {
    pem = forge.pki.publicKeyToPem(publicKey);
  } catch (e) {
    pem = "Could not convert public key to PEM.";
  }

  return { algorithm, details, pem };
};

const formatExtensionValue = (ext: any): string => {
  if (!ext) return 'N/A';

  if (ext.name === 'subjectAltName' && ext.altNames) {
    return ext.altNames.map((alt: any) => {
      if (alt.type === 2) return `DNS:${alt.value}`; // dNSName
      if (alt.type === 7) return `IP:${alt.value}`; // iPAddress
      if (alt.type === 1) return `Email:${alt.value}`; // rfc822Name
      if (alt.type === 6) return `URI:${alt.value}`; // uniformResourceIdentifier
      return `Type ${alt.type}: ${alt.value}`;
    }).join(', ');
  }
  if (ext.name === 'keyUsage') {
    const usages = [];
    if (ext.digitalSignature) usages.push('Digital Signature');
    if (ext.nonRepudiation) usages.push('Non-Repudiation');
    if (ext.keyEncipherment) usages.push('Key Encipherment');
    if (ext.dataEncipherment) usages.push('Data Encipherment');
    if (ext.keyAgreement) usages.push('Key Agreement');
    if (ext.keyCertSign) usages.push('Certificate Sign');
    if (ext.cRLSign) usages.push('CRL Sign');
    if (ext.encipherOnly) usages.push('Encipher Only');
    if (ext.decipherOnly) usages.push('Decipher Only');
    return usages.join(', ');
  }
  if (ext.name === 'extKeyUsage') {
    return Object.entries(ext)
      .filter(([key, value]) => value === true && forge.pki.oids[key])
      .map(([key]) => forge.pki.oids[key])
      .join(', ');
  }
   if (ext.name === 'basicConstraints') {
    return `CA: ${ext.cA ? 'True' : 'False'}${ext.pathLenConstraint !== undefined ? `, Path Length: ${ext.pathLenConstraint}` : ''}`;
  }

  // Fallback for other extensions
  if (typeof ext.value === 'string' && ext.value.startsWith('0x')) { // Hex string
    return forge.util.hexToBytes(ext.value.substring(2)); // Try to convert to readable if possible
  }
  return typeof ext.value === 'object' ? JSON.stringify(ext.value) : String(ext.value);
};


export default function CertificateViewerPage() {
  const [certificateInput, setCertificateInput] = useState('');
  const [parsedDetails, setParsedDetails] = useState<ParsedCertificateDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isClient, certificateInput]);

  const handleParseCertificate = () => {
    if (!certificateInput.trim()) {
      setError('Please paste a PEM-encoded certificate.');
      setParsedDetails(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setParsedDetails(null);

    setTimeout(() => { // Simulate async for UX and allow UI update
      try {
        const cert = forge.pki.certificateFromPem(certificateInput) as any;
 
        const getFingerprint = (mdAlgorithm: { create: () => forge.md.MessageDigest }) => {
          const md = mdAlgorithm.create();
          md.update(forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes());
          return md.digest().toHex().match(/.{1,2}/g)?.join(':').toUpperCase() || 'N/A';
        };
        
        const details: ParsedCertificateDetails = {
          subject: cert.subject.attributes.map(formatAttribute) as CertificateAttribute[],
          issuer: cert.issuer.attributes.map(formatAttribute) as CertificateAttribute[],
          validity: {
            notBefore: cert.validity.notBefore.toLocaleString(),
            notAfter: cert.validity.notAfter.toLocaleString(),
          },
          serialNumber: (cert.serialNumber as string).toUpperCase(),
          signatureAlgorithm: OID_MAP[cert.signatureOid as string] || cert.signatureOid || 'N/A',
          publicKey: formatPublicKey(cert.publicKey) as ParsedCertificateDetails['publicKey'],
          extensions: (cert.extensions as any[]).map((ext: any): ParsedExtension => {
            const name: string = OID_MAP[ext.id as string] || ext.name || ext.id || 'Unknown Extension';
            return {
              id: ext.id || 'N/A',
              name: name,
              critical: ext.critical || false,
              value: ext.value,
              valueString: formatExtensionValue(ext),
            };
          }),
          fingerprints: {
            sha1: getFingerprint(forge.md.sha1),
            sha256: getFingerprint(forge.md.sha256),
          },
          pem: certificateInput,
        };
        setParsedDetails(details);
      } catch (e: any) {
        setError(`Parsing Error: ${e.message || 'Invalid certificate format or content.'}`);
        console.error("Certificate parsing error:", e);
      } finally {
        setIsLoading(false);
      }
    }, 100);
  };

  const handleCopyToClipboard = async (text: string, type: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: `${type} Copied!`, description: `The ${type.toLowerCase()} has been copied.` });
    } catch (err) {
      toast({ title: "Copy Failed", description: `Could not copy ${type.toLowerCase()}.`, variant: "destructive" });
    }
  };

  const renderAttributesTable = (title: string, attributes: CertificateAttribute[]) => (
    <Card>
      <CardHeader><CardTitle className="text-lg font-headline">{title}</CardTitle></CardHeader>
      <CardContent>
        {attributes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Field</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attributes.map((attr, index) => (
                <TableRow key={`${title}-${index}`}>
                  <TableCell className="font-medium break-words">{attr.shortName || attr.name}</TableCell>
                  <TableCell className="break-all">{attr.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : <p className="text-muted-foreground">No {title.toLowerCase()} attributes found.</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader
        title="X.509 Certificate Viewer"
        description="Paste a PEM-encoded certificate to view its details."
        icon={FileKey}
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Certificate Input (PEM Format)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            ref={textareaRef}
            placeholder="-----BEGIN CERTIFICATE-----\nMIIC...\n-----END CERTIFICATE-----"
            value={certificateInput}
            onChange={(e) => setCertificateInput(e.target.value)}
            className="w-full resize-none border rounded-md focus-visible:ring-1 p-4 font-code text-sm min-h-[200px]"
            style={{ overflowY: 'hidden' }}
            aria-label="Certificate PEM Input"
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleParseCertificate} disabled={isLoading || !isClient}>
            {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Parsing...' : 'Parse Certificate'}
          </Button>
        </CardFooter>
      </Card>

      {isClient && error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isClient && parsedDetails && !error && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg font-headline">General Information</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                <div><strong>Serial Number:</strong> <span className="font-code break-all">{parsedDetails.serialNumber}</span></div>
                <div><strong>Signature Algorithm:</strong> {parsedDetails.signatureAlgorithm}</div>
                <div><strong>Valid From:</strong> {parsedDetails.validity.notBefore}</div>
                <div><strong>Valid Until:</strong> {parsedDetails.validity.notAfter}</div>
              </div>
            </CardContent>
          </Card>

          {renderAttributesTable("Subject", parsedDetails.subject)}
          {renderAttributesTable("Issuer", parsedDetails.issuer)}

          <Card>
            <CardHeader><CardTitle className="text-lg font-headline">Public Key Information</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><strong>Algorithm:</strong> {parsedDetails.publicKey.algorithm}</div>
              <div><strong>Details:</strong> {parsedDetails.publicKey.details}</div>
              {parsedDetails.publicKey.pem && (
                <div>
                  <strong>Public Key (PEM):</strong>
                  <Button variant="outline" size="sm" className="ml-2" onClick={() => handleCopyToClipboard(parsedDetails.publicKey.pem!, 'Public Key PEM')}>
                     <Copy className="mr-1 h-3 w-3" /> Copy
                  </Button>
                  <Textarea value={parsedDetails.publicKey.pem} readOnly className="font-code text-xs mt-1 bg-muted/50 max-h-40" rows={3}/>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle className="text-lg font-headline">Fingerprints</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div><strong>SHA-1:</strong> <span className="font-code break-all">{parsedDetails.fingerprints.sha1}</span></div>
              <div><strong>SHA-256:</strong> <span className="font-code break-all">{parsedDetails.fingerprints.sha256}</span></div>
            </CardContent>
          </Card>

          {parsedDetails.extensions.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg font-headline">Extensions</CardTitle></CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {parsedDetails.extensions.map((ext, index) => (
                    <AccordionItem value={`ext-${index}`} key={`ext-${index}`}>
                      <AccordionTrigger className="text-sm hover:no-underline">
                        <div className="flex items-center gap-2">
                          <span>{ext.name}</span>
                          {ext.critical && <Badge variant="destructive" className="text-xs px-1.5 py-0">Critical</Badge>}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm font-code bg-muted/30 p-3 rounded-md whitespace-pre-wrap break-all">
                        {ext.valueString || 'Could not format extension value.'}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}
           <Card>
            <CardHeader><CardTitle className="text-lg font-headline">Raw Certificate (PEM)</CardTitle></CardHeader>
            <CardContent>
                 <Button variant="outline" size="sm" className="mb-2" onClick={() => handleCopyToClipboard(parsedDetails.pem, 'Full Certificate PEM')}>
                     <Copy className="mr-1 h-3 w-3" /> Copy PEM
                  </Button>
                <Textarea value={parsedDetails.pem} readOnly className="font-code text-xs bg-muted/50 max-h-96" rows={10}/>
            </CardContent>
           </Card>
        </div>
      )}
    </div>
  );
}

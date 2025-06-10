
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { QrCode as QrCodeIcon, Download, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode.react';
import { useToast } from "@/hooks/use-toast";

type QrDataType = 'text' | 'url' | 'wifi' | 'sms' | 'email' | 'geo';

const initialData = {
  text: 'Hello, DevToolbox!',
  url: 'https://firebase.google.com/project-idx',
  wifiSsid: 'MyNetwork',
  wifiPassword: 'MyPassword123',
  wifiEncryption: 'WPA',
  smsPhone: '+1234567890',
  smsMessage: 'Check out DevToolbox!',
  emailTo: 'test@example.com',
  emailSubject: 'DevToolbox QR Code',
  emailBody: 'Here is the QR code I generated!',
  geoLatitude: '34.0522',
  geoLongitude: '-118.2437',
};

export default function QrCodeGeneratorPage() {
  const [activeTab, setActiveTab] = useState<QrDataType>('text');
  const [formData, setFormData] = useState(initialData);
  const [qrValue, setQrValue] = useState('');
  const [qrSize, setQrSize] = useState<number>(256);
  const [qrErrorLevel, setQrErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [error, setError] = useState<string | null>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleInputChange = (field: keyof typeof initialData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const generateQrValue = useCallback(() => {
    setError(null);
    switch (activeTab) {
      case 'text':
        if (!formData.text.trim()) setError('Text cannot be empty.');
        setQrValue(formData.text);
        break;
      case 'url':
        if (!formData.url.trim()) {
          setError('URL cannot be empty.');
          setQrValue('');
          return;
        }
        try {
          new URL(formData.url); // Validate URL
          setQrValue(formData.url);
        } catch (e) {
          setError('Invalid URL format.');
          setQrValue('');
        }
        break;
      case 'wifi':
        if (!formData.wifiSsid.trim()) {
          setError('WiFi SSID (Network Name) cannot be empty.');
          setQrValue('');
          return;
        }
        setQrValue(`WIFI:T:${formData.wifiEncryption};S:${formData.wifiSsid};P:${formData.wifiPassword};;`);
        break;
      case 'sms':
        if (!formData.smsPhone.trim()) {
          setError('SMS Phone Number cannot be empty.');
          setQrValue('');
          return;
        }
        setQrValue(`SMSTO:${formData.smsPhone}:${formData.smsMessage}`);
        break;
      case 'email':
        if (!formData.emailTo.trim()) {
          setError('Email Recipient cannot be empty.');
          setQrValue('');
          return;
        }
        const emailParams = new URLSearchParams();
        if (formData.emailSubject) emailParams.append('subject', formData.emailSubject);
        if (formData.emailBody) emailParams.append('body', formData.emailBody);
        setQrValue(`mailto:${formData.emailTo}${emailParams.toString() ? '?' + emailParams.toString() : ''}`);
        break;
      case 'geo':
        if (!formData.geoLatitude.trim() || !formData.geoLongitude.trim()) {
          setError('Latitude and Longitude cannot be empty.');
          setQrValue('');
          return;
        }
        if (isNaN(parseFloat(formData.geoLatitude)) || isNaN(parseFloat(formData.geoLongitude))) {
          setError('Latitude and Longitude must be valid numbers.');
          setQrValue('');
          return;
        }
        setQrValue(`geo:${formData.geoLatitude},${formData.geoLongitude}`);
        break;
      default:
        setQrValue('');
    }
  }, [activeTab, formData]);

  useEffect(() => {
    if (isClient) {
      generateQrValue();
    }
  }, [activeTab, formData, generateQrValue, isClient]);

  const handleDownload = () => {
    if (!qrCodeRef.current || error || !qrValue) {
        toast({ title: "Download Failed", description: error || "No QR code to download.", variant: "destructive" });
        return;
    }
    const canvas = qrCodeRef.current.querySelector('canvas');
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `qrcode-${activeTab}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast({ title: "Download Started", description: "Your QR code is being downloaded." });
    } else {
        toast({ title: "Download Failed", description: "Could not find QR code canvas.", variant: "destructive" });
    }
  };

  const renderFormFields = () => {
    switch (activeTab) {
      case 'text':
        return (
          <Textarea placeholder="Enter text" value={formData.text} onChange={e => handleInputChange('text', e.target.value)} className="min-h-[100px] font-code" />
        );
      case 'url':
        return (
          <Input type="url" placeholder="https://example.com" value={formData.url} onChange={e => handleInputChange('url', e.target.value)} className="font-code" />
        );
      case 'wifi':
        return (
          <div className="space-y-4">
            <Input placeholder="Network Name (SSID)" value={formData.wifiSsid} onChange={e => handleInputChange('wifiSsid', e.target.value)} />
            <Input type="password" placeholder="Password" value={formData.wifiPassword} onChange={e => handleInputChange('wifiPassword', e.target.value)} />
            <Select value={formData.wifiEncryption} onValueChange={value => handleInputChange('wifiEncryption', value)}>
              <SelectTrigger><SelectValue placeholder="Encryption Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="WPA">WPA/WPA2</SelectItem>
                <SelectItem value="WEP">WEP</SelectItem>
                <SelectItem value="nopass">None (Open Network)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case 'sms':
        return (
          <div className="space-y-4">
            <Input type="tel" placeholder="Phone Number (e.g., +1234567890)" value={formData.smsPhone} onChange={e => handleInputChange('smsPhone', e.target.value)} className="font-code" />
            <Textarea placeholder="Message (optional)" value={formData.smsMessage} onChange={e => handleInputChange('smsMessage', e.target.value)} className="min-h-[80px] font-code" />
          </div>
        );
       case 'email':
        return (
          <div className="space-y-4">
            <Input type="email" placeholder="Recipient Email Address" value={formData.emailTo} onChange={e => handleInputChange('emailTo', e.target.value)} className="font-code" />
            <Input placeholder="Subject (optional)" value={formData.emailSubject} onChange={e => handleInputChange('emailSubject', e.target.value)} className="font-code" />
            <Textarea placeholder="Body (optional)" value={formData.emailBody} onChange={e => handleInputChange('emailBody', e.target.value)} className="min-h-[80px] font-code" />
          </div>
        );
      case 'geo':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input type="text" placeholder="Latitude (e.g., 34.0522)" value={formData.geoLatitude} onChange={e => handleInputChange('geoLatitude', e.target.value)} className="font-code" />
            <Input type="text" placeholder="Longitude (e.g., -118.2437)" value={formData.geoLongitude} onChange={e => handleInputChange('geoLongitude', e.target.value)} className="font-code" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader
        title="QR Code Generator"
        description="Create QR codes for text, URLs, WiFi, SMS, Email, and Geo Locations."
        icon={QrCodeIcon}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline">QR Code Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as QrDataType)} className="w-full">
              <TabsList className="grid w-full grid-cols-6 mb-4">
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="url">URL</TabsTrigger>
                <TabsTrigger value="wifi">WiFi</TabsTrigger>
                <TabsTrigger value="sms">SMS</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="geo">Geo</TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab} className="mt-0">
                {renderFormFields()}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="md:col-span-1 row-start-1 md:row-start-auto">
          <CardHeader>
            <CardTitle className="font-headline">Generated QR Code</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            {isClient && error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
             {isClient && !error && qrValue && (
                <div ref={qrCodeRef} className="p-4 bg-white rounded-md inline-block border">
                  <QRCode value={qrValue} size={qrSize} level={qrErrorLevel} renderAs="canvas" />
                </div>
            )}
             {isClient && !error && !qrValue && (
                <div className="w-full h-[256px] bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                    Enter data to generate QR Code
                </div>
            )}
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="space-y-1">
                <Label htmlFor="qrSize">Size (px)</Label>
                <Input id="qrSize" type="number" value={qrSize} onChange={e => setQrSize(parseInt(e.target.value, 10) || 64)} min="64" max="1024" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="qrErrorLevel">Error Correction</Label>
                <Select value={qrErrorLevel} onValueChange={value => setQrErrorLevel(value as 'L' | 'M' | 'Q' | 'H')}>
                  <SelectTrigger id="qrErrorLevel"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (L)</SelectItem>
                    <SelectItem value="M">Medium (M)</SelectItem>
                    <SelectItem value="Q">Quartile (Q)</SelectItem>
                    <SelectItem value="H">High (H)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleDownload} disabled={!qrValue || !!error} className="w-full">
              <Download className="mr-2 h-4 w-4" /> Download PNG
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

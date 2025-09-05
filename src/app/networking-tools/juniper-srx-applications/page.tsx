"use client";

import { ListTree } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { defaultApplications } from "@/lib/juniper-srx-apps";

export default function JuniperSrxApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredApplications = useMemo(() => {
    if (!searchTerm.trim()) {
      return defaultApplications;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return defaultApplications.filter(
      (app) =>
        app.name.toLowerCase().includes(lowercasedFilter) ||
        app.description.toLowerCase().includes(lowercasedFilter) ||
        app.protocol.toLowerCase().includes(lowercasedFilter) ||
        app.port.toString().includes(lowercasedFilter),
    );
  }, [searchTerm]);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Juniper SRX Default Application List"
        description="Browse and search the default application list for Juniper SRX firewalls."
        icon={ListTree}
      />
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            Search Applications ({filteredApplications.length} of{" "}
            {defaultApplications.length} matching)
          </CardTitle>
          <div className="pt-2">
            <Input
              type="text"
              placeholder="Search by name, description, protocol, or port..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              aria-label="Search applications"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Protocol</TableHead>
                  <TableHead className="w-[100px]">Port</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No results found for &quot;{searchTerm}&quot;.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => (
                    <TableRow key={app.name}>
                      <TableCell className="font-medium font-code">
                        {app.name}
                      </TableCell>
                      <TableCell>{app.description}</TableCell>
                      <TableCell className="font-code">{app.protocol}</TableCell>
                      <TableCell className="font-code">{app.port}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

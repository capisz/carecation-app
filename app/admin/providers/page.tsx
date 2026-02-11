"use client";

import { useState } from "react";
import { usePageReady } from "@/hooks/use-page-ready";
import { AppShell } from "@/components/app-shell";
import { getAllProviders, type Provider } from "@/lib/data/providers-repo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Star, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function AdminProvidersPage() {
  usePageReady();
  const [list, setList] = useState<Provider[]>(getAllProviders);
  const [editProvider, setEditProvider] = useState<Provider | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    country: "",
    city: "",
    rating: "",
    priceMin: "",
    priceMax: "",
  });

  const openCreate = () => {
    setEditProvider(null);
    setForm({ name: "", country: "", city: "", rating: "", priceMin: "", priceMax: "" });
    setDialogOpen(true);
  };

  const openEdit = (provider: Provider) => {
    setEditProvider(provider);
    setForm({
      name: provider.name,
      country: provider.country,
      city: provider.city,
      rating: String(provider.rating),
      priceMin: String(provider.priceRangeUSD.min),
      priceMax: String(provider.priceRangeUSD.max),
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.country || !form.city) return;

    if (editProvider) {
      setList((prev) =>
        prev.map((p) =>
          p.id === editProvider.id
            ? {
                ...p,
                name: form.name,
                country: form.country,
                city: form.city,
                rating: Number(form.rating) || p.rating,
                priceRangeUSD: {
                  min: Number(form.priceMin) || p.priceRangeUSD.min,
                  max: Number(form.priceMax) || p.priceRangeUSD.max,
                },
              }
            : p
        )
      );
      toast({ title: "Provider updated", description: `${form.name} has been updated.` });
    } else {
      const newProvider: Provider = {
        id: `custom-${Date.now()}`,
        name: form.name,
        country: form.country,
        city: form.city,
        procedures: [],
        languages: ["English"],
        accreditation: [],
        priceRangeUSD: {
          min: Number(form.priceMin) || 0,
          max: Number(form.priceMax) || 0,
        },
        rating: Number(form.rating) || 0,
        reviewCount: 0,
        packageIncludes: [],
        recoveryDays: 3,
        images: [],
        description: "",
      };
      setList((prev) => [...prev, newProvider]);
      toast({ title: "Provider added", description: `${form.name} has been created.` });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const provider = list.find((p) => p.id === id);
    setList((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Provider removed", description: `${provider?.name ?? "Provider"} has been deleted.` });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Admin: Providers
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage the provider directory ({list.length} providers)
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add provider
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editProvider ? "Edit provider" : "Add new provider"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Clinic name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input
                      value={form.country}
                      onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                      placeholder="Country"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      placeholder="City"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={form.rating}
                    onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                    placeholder="4.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Min price (USD)</Label>
                    <Input
                      type="number"
                      value={form.priceMin}
                      onChange={(e) => setForm((f) => ({ ...f, priceMin: e.target.value }))}
                      placeholder="500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max price (USD)</Label>
                    <Input
                      type="number"
                      value={form.priceMax}
                      onChange={(e) => setForm((f) => ({ ...f, priceMax: e.target.value }))}
                      placeholder="5000"
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={handleSave}>
                  {editProvider ? "Save changes" : "Add provider"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Price Range</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{provider.name}</p>
                          <div className="flex gap-1 mt-1">
                            {provider.procedures.slice(0, 2).map((p) => (
                              <Badge key={p} variant="secondary" className="text-xs">
                                {p}
                              </Badge>
                            ))}
                            {provider.procedures.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{provider.procedures.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {provider.city}, {provider.country}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                          <span className="text-sm font-medium">{provider.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        ${provider.priceRangeUSD.min.toLocaleString()} - ${provider.priceRangeUSD.max.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(provider)}
                            aria-label="Edit provider"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(provider.id)}
                            aria-label="Delete provider"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </AppShell>
  );
}

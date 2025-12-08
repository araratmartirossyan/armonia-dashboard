import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { License, User, CreateLicenseRequest, KnowledgeBase } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Key, CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

export default function LicenseManagement() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [validityDays, setValidityDays] = useState<number | undefined>();
  const [selectedKnowledgeBaseIds, setSelectedKnowledgeBaseIds] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [licensesData, usersData, kbData] = await Promise.all([
        api.getLicenses(),
        api.getUsers(),
        api.getKnowledgeBases(),
      ]);
      setLicenses(licensesData);
      setUsers(usersData);
      setKnowledgeBases(kbData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLicense = async () => {
    if (!selectedUserId) {
      toast({
        title: 'Error',
        description: 'Please select a user',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create the license
      const request: CreateLicenseRequest = {
        userId: selectedUserId,
        ...(validityDays && validityDays > 0 ? { validityPeriodDays: validityDays } : {}),
      };
      const newLicense = await api.createLicense(request);

      // Attach selected knowledge bases
      if (selectedKnowledgeBaseIds.length > 0) {
        const attachPromises = selectedKnowledgeBaseIds.map((kbId) =>
          api.attachKnowledgeBase({
            kbId,
            licenseId: newLicense.id,
          })
        );
        await Promise.all(attachPromises);
      }

      toast({
        title: 'Success',
        description: `License created successfully${selectedKnowledgeBaseIds.length > 0 ? ` with ${selectedKnowledgeBaseIds.length} knowledge base(s) attached` : ''}`,
      });
      setIsDialogOpen(false);
      setSelectedUserId('');
      setValidityDays(undefined);
      setSelectedKnowledgeBaseIds([]);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create license',
        variant: 'destructive',
      });
    }
  };

  const handleKnowledgeBaseToggle = (kbId: string) => {
    setSelectedKnowledgeBaseIds((prev) =>
      prev.includes(kbId)
        ? prev.filter((id) => id !== kbId)
        : [...prev, kbId]
    );
  };

  const handleToggleLicense = async (license: License) => {
    try {
      if (license.isActive) {
        await api.deactivateLicense(license.id);
        toast({
          title: 'Success',
          description: 'License deactivated',
        });
      } else {
        await api.activateLicense(license.id);
        toast({
          title: 'Success',
          description: 'License activated',
        });
      }
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update license',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">License Management</h1>
          <p className="text-muted-foreground">Manage licenses for users</p>
        </div>
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              // Reset form when dialog closes
              setSelectedUserId('');
              setValidityDays(undefined);
              setSelectedKnowledgeBaseIds([]);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create License
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New License</DialogTitle>
              <DialogDescription>
                Create a new license for a user. Leave validity period empty for unlimited license.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="user">User *</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.email} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="validity">Validity Period (days)</Label>
                <Input
                  id="validity"
                  type="number"
                  placeholder="Leave empty for unlimited"
                  value={validityDays || ''}
                  onChange={(e) => setValidityDays(e.target.value ? parseInt(e.target.value) : undefined)}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label>Knowledge Bases (Optional)</Label>
                <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                  {knowledgeBases.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No knowledge bases available</p>
                  ) : (
                    knowledgeBases.map((kb) => (
                      <div key={kb.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`kb-${kb.id}`}
                          checked={selectedKnowledgeBaseIds.includes(kb.id)}
                          onCheckedChange={() => handleKnowledgeBaseToggle(kb.id)}
                        />
                        <label
                          htmlFor={`kb-${kb.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                        >
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          {kb.name}
                        </label>
                      </div>
                    ))
                  )}
                </div>
                {selectedKnowledgeBaseIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedKnowledgeBaseIds.length} knowledge base(s) selected
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateLicense}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Licenses</CardTitle>
          <CardDescription>All licenses in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>License Key</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires At</TableHead>
                <TableHead>Knowledge Bases</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No licenses found
                  </TableCell>
                </TableRow>
              ) : (
                licenses.map((license) => (
                  <TableRow key={license.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <code className="text-sm">{license.key}</code>
                      </div>
                    </TableCell>
                    <TableCell>{license.user.email}</TableCell>
                    <TableCell>
                      {license.isActive ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600">
                          <XCircle className="h-4 w-4" />
                          Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {license.expiresAt
                        ? format(new Date(license.expiresAt), 'PPp')
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      {license.knowledgeBases?.length || 0}
                    </TableCell>
                    <TableCell>
                      {format(new Date(license.createdAt), 'PPp')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleLicense(license)}
                      >
                        {license.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


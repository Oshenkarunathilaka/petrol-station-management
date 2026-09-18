import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus } from 'lucide-react'

// Dummy data for now since we don't have DB connection
const fuelTypes = [
  { id: '1', name: 'Petrol 95', price: 1.50, color: '#16a34a' },
  { id: '2', name: 'Diesel', price: 1.45, color: '#dc2626' },
  { id: '3', name: 'Premium 98', price: 1.65, color: '#2563eb' },
]

export default function FuelManagementPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Fuel Management</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Fuel Type
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Fuel Types & Pricing</CardTitle>
          <CardDescription>
            Manage the different types of fuel sold at your station and their current prices per liter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Color</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price / Liter</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fuelTypes.map((fuel) => (
                <TableRow key={fuel.id}>
                  <TableCell>
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: fuel.color }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{fuel.name}</TableCell>
                  <TableCell>${fuel.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

import React from 'react';
import { Card, Form, Button, Table, InputGroup, Badge } from 'react-bootstrap';
import { FaPlus, FaTrash } from 'react-icons/fa';

const FaPlusIcon = FaPlus as any;
const FaTrashIcon = FaTrash as any;

interface BillingItem {
  id: number;
  code: string;
  name: string;
  unit: number;
  cost: number;
  discount: number;
  total: number;
}

interface ProcedureBillingProps {
  items: BillingItem[];
  onAddItem: (item: Omit<BillingItem, 'id' | 'total'>) => void;
  onRemoveItem: (id: number) => void;
  procedureNameInputRef?: React.RefObject<HTMLInputElement>;
}

const ProcedureBilling: React.FC<ProcedureBillingProps> = ({ items, onAddItem, onRemoveItem, procedureNameInputRef }) => {
  const [newItem, setNewItem] = React.useState({
    code: '',
    name: '',
    unit: 1,
    cost: 0,
    discount: 0
  });

  const handleAddClick = () => {
    if (!newItem.name || !newItem.code) return;
    onAddItem(newItem);
    setNewItem({ code: '', name: '', unit: 1, cost: 0, discount: 0 });
  };

  return (
    <Card className="border-0 shadow-sm" style={{height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column'}}>
      <Card.Body className="p-0" style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
        {/* Item Entry */}
        <div className="p-3 bg-light border-bottom" style={{flexShrink: 0}}>
          <div className="flex-form-row">
            <div className="flex-form-item flex-item-1">
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Code</Form.Label>
                <Form.Control 
                  placeholder="Code"
                  value={newItem.code}
                  onChange={(e) => setNewItem({...newItem, code: e.target.value})}
                />
              </Form.Group>
            </div>
            <div className="flex-form-item flex-item-4">
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Procedure Name</Form.Label>
                <Form.Control 
                  ref={procedureNameInputRef}
                  placeholder="Procedure Name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                />
              </Form.Group>
            </div>
            <div className="flex-form-item flex-item-1">
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Unit</Form.Label>
                <Form.Control 
                  type="number"
                  min="1"
                  size="sm"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({...newItem, unit: parseInt(e.target.value) || 0})}
                />
              </Form.Group>
            </div>
            <div className="flex-form-item flex-item-2">
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Cost</Form.Label>
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-white border-end-0">₹</InputGroup.Text>
                  <Form.Control 
                    type="number"
                    className="border-start-0"
                    value={newItem.cost}
                    onChange={(e) => setNewItem({...newItem, cost: parseFloat(e.target.value) || 0})}
                  />
                </InputGroup>
              </Form.Group>
            </div>
            <div className="flex-form-item flex-item-1">
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Disc</Form.Label>
                <Form.Control 
                  type="number"
                  size="sm"
                  value={newItem.discount}
                  onChange={(e) => setNewItem({...newItem, discount: parseFloat(e.target.value) || 0})}
                />
              </Form.Group>
            </div>
            <div className="flex-form-item flex-item-2">
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Total</Form.Label>
                <Form.Control 
                  type="text"
                  size="sm"
                  readOnly
                  value={((newItem.cost * newItem.unit) - newItem.discount).toFixed(2)}
                  className="bg-white fw-bold text-end"
                />
              </Form.Group>
            </div>
            <div className="flex-form-item flex-item-1">
              <Button 
                variant="primary" 
                size="sm" 
                className="w-100"
                onClick={handleAddClick}
              >
                <FaPlusIcon />
              </Button>
            </div>
          </div>
        </div>

        {/* Items Table - Scrollable */}
        <div style={{overflowY: 'auto', flex: 1, minHeight: 0}}>
          <Table hover className="mb-0 align-middle" style={{fontSize: '0.75rem'}}>
            <thead className="bg-light text-muted text-uppercase" style={{position: 'sticky', top: 0, zIndex: 1, fontSize: '0.65rem'}}>
              <tr>
                <th className="ps-3 py-2" style={{width: '5%'}}>#</th>
                <th className="py-2" style={{width: '15%'}}>Code</th>
                <th className="py-2" style={{width: '35%'}}>Procedures Name</th>
                <th className="text-center py-2" style={{width: '10%'}}>Unit</th>
                <th className="text-end py-2" style={{width: '10%'}}>Cost</th>
                <th className="text-end py-2" style={{width: '10%'}}>Discount</th>
                <th className="text-end py-2" style={{width: '10%'}}>Total</th>
                <th className="text-center py-2" style={{width: '5%'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    <div className="d-flex flex-column align-items-center">
                      <p className="mb-0">No procedures added yet</p>
                      <small>Add procedures using the form above</small>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="ps-3 py-2">{index + 1}</td>
                    <td className="py-2"><Badge bg="light" text="dark" className="border" style={{fontSize: '0.65rem'}}>{item.code}</Badge></td>
                    <td className="fw-medium py-2">{item.name}</td>
                    <td className="text-center py-2">{item.unit}</td>
                    <td className="text-end py-2">{item.cost.toFixed(2)}</td>
                    <td className="text-end text-success py-2">-{item.discount.toFixed(2)}</td>
                    <td className="text-end fw-bold py-2">{item.total.toFixed(2)}</td>
                    <td className="text-center py-2">
                      <Button 
                        variant="link" 
                        className="text-danger p-0" 
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <FaTrashIcon size={12} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProcedureBilling;

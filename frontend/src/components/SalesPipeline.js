import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { 
  Plus, 
  DollarSign,
  Calendar,
  User,
  Edit,
  Trash2,
  Target
} from 'lucide-react';

const SalesPipeline = () => {
  const { API } = useContext(AuthContext);
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [draggedDeal, setDraggedDeal] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    value: '',
    expected_close_date: '',
    contact_id: '',
    stage: 'prospect',
    description: ''
  });

  const pipelineStages = [
    { 
      id: 'prospect', 
      title: 'Prospect', 
      color: 'bg-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-300'
    },
    { 
      id: 'proposal', 
      title: 'Proposal', 
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300'
    },
    { 
      id: 'negotiation', 
      title: 'Negotiation', 
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300'
    },
    { 
      id: 'won', 
      title: 'Won', 
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300'
    },
    { 
      id: 'lost', 
      title: 'Lost', 
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300'
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch deals and contacts
      const [dealsResponse, contactsResponse] = await Promise.all([
        fetch(`${API}/deals`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API}/contacts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (dealsResponse.ok) {
        const dealsData = await dealsResponse.json();
        setDeals(dealsData);
      }

      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        setContacts(contactsData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const dealData = {
        ...formData,
        value: parseFloat(formData.value),
        expected_close_date: new Date(formData.expected_close_date).toISOString()
      };

      const response = await fetch(`${API}/deals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dealData)
      });

      if (response.ok) {
        fetchData();
        setShowAddModal(false);
        setFormData({
          title: '',
          value: '',
          expected_close_date: '',
          contact_id: '',
          stage: 'prospect',
          description: ''
        });
      }
    } catch (error) {
      console.error('Failed to create deal:', error);
    }
  };

  const handleDragStart = (e, deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    
    if (!draggedDeal || draggedDeal.stage === newStage) {
      setDraggedDeal(null);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const contact = contacts.find(c => c.id === draggedDeal.contact_id);
      
      const updatedDeal = {
        title: draggedDeal.title,
        value: draggedDeal.value,
        expected_close_date: draggedDeal.expected_close_date,
        contact_id: draggedDeal.contact_id,
        stage: newStage,
        description: draggedDeal.description
      };

      const response = await fetch(`${API}/deals/${draggedDeal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedDeal)
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to update deal:', error);
    }

    setDraggedDeal(null);
  };

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? contact.name : 'Unknown Contact';
  };

  const getStageDeals = (stageId) => {
    return deals.filter(deal => deal.stage === stageId);
  };

  const getTotalStageValue = (stageId) => {
    return getStageDeals(stageId).reduce((sum, deal) => sum + deal.value, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-600 mt-1">Track deals through your sales process</p>
        </div>
        
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button className="btn-primary text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Deal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Deal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Deal Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              <Input
                type="number"
                placeholder="Deal Value ($)"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
                required
              />
              <Input
                type="date"
                placeholder="Expected Close Date"
                value={formData.expected_close_date}
                onChange={(e) => setFormData({...formData, expected_close_date: e.target.value})}
                required
              />
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.contact_id}
                onChange={(e) => setFormData({...formData, contact_id: e.target.value})}
                required
              >
                <option value="">Select Contact</option>
                {contacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name} ({contact.email})
                  </option>
                ))}
              </select>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.stage}
                onChange={(e) => setFormData({...formData, stage: e.target.value})}
              >
                {pipelineStages.map(stage => (
                  <option key={stage.id} value={stage.id}>
                    {stage.title}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <div className="flex space-x-3">
                <Button type="submit" className="flex-1 btn-primary text-white">
                  Create Deal
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      title: '', value: '', expected_close_date: '',
                      contact_id: '', stage: 'prospect', description: ''
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pipeline Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {pipelineStages.map(stage => (
          <Card key={stage.id} className={`p-4 ${stage.bgColor} ${stage.borderColor} border-l-4`}>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">{stage.title}</h3>
              <div className="mt-2">
                <p className="text-2xl font-bold text-gray-900">
                  {getStageDeals(stage.id).length}
                </p>
                <p className="text-sm text-gray-600">
                  ${getTotalStageValue(stage.id).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pipeline Kanban Board */}
      <div className="bg-gray-100 p-6 rounded-lg overflow-x-auto">
        <div className="flex space-x-6 min-w-max">
          {pipelineStages.map(stage => (
            <div 
              key={stage.id}
              className="flex-shrink-0 w-80"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className={`pipeline-column p-4 rounded-lg mb-4 ${stage.bgColor} ${stage.borderColor} border-2`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{stage.title}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${stage.color} text-white`}>
                      {getStageDeals(stage.id).length}
                    </Badge>
                    <Target className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {getStageDeals(stage.id).map(deal => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal)}
                      className="deal-card p-4 rounded-lg shadow-sm cursor-move"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 flex-1">
                          {deal.title}
                        </h4>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold text-green-600">
                            ${deal.value.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span>{getContactName(deal.contact_id)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(deal.expected_close_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {deal.description && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-700">
                          {deal.description}
                        </div>
                      )}

                      <div className="mt-3 text-xs text-gray-500">
                        Created {new Date(deal.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  
                  {getStageDeals(stage.id).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No deals in this stage</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center space-x-3">
          <Target className="h-5 w-5 text-blue-600" />
          <div>
            <h4 className="font-medium text-blue-900">How to use the pipeline:</h4>
            <p className="text-sm text-blue-700 mt-1">
              Drag and drop deals between stages to update their progress. 
              Add new deals using the "Add Deal" button above.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SalesPipeline;
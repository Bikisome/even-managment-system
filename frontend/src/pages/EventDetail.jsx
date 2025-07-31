import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventsAPI, ticketsAPI, attendeesAPI, forumsAPI, pollsAPI, qaAPI } from '../services/api';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Edit,
  Trash2,
  MessageSquare,
  BarChart3,
  HelpCircle,
  Plus,
  Ticket
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [forums, setForums] = useState([]);
  const [polls, setPolls] = useState([]);
  const [qa, setQa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchEventData();
  }, [id]);

  const fetchEventData = async () => {
    setLoading(true);
    try {
      const [eventRes, ticketsRes, attendeesRes, forumsRes, pollsRes, qaRes] = await Promise.all([
        eventsAPI.getById(id),
        ticketsAPI.getByEvent(id),
        attendeesAPI.getEventAttendees(id),
        forumsAPI.getByEvent(id),
        pollsAPI.getByEvent(id),
        qaAPI.getByEvent(id)
      ]);

      setEvent(eventRes.data);
      setTickets(ticketsRes.data || []);
      setAttendees(attendeesRes.data || []);
      setForums(forumsRes.data || []);
      setPolls(pollsRes.data || []);
      setQa(qaRes.data || []);
    } catch (error) {
      console.error('Failed to fetch event data:', error);
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventsAPI.delete(id);
        toast.success('Event deleted successfully');
        // Redirect to events page
        window.location.href = '/events';
      } catch (error) {
        console.error('Failed to delete event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Event not found</h2>
        <p className="text-gray-600 mt-2">The event you're looking for doesn't exist.</p>
        <Link to="/events" className="btn btn-primary mt-4">
          Back to Events
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Calendar },
    { id: 'tickets', name: 'Tickets', icon: Ticket },
    { id: 'attendees', name: 'Attendees', icon: Users },
    { id: 'forums', name: 'Forums', icon: MessageSquare },
    { id: 'polls', name: 'Polls', icon: BarChart3 },
    { id: 'qa', name: 'Q&A', icon: HelpCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
          <p className="text-gray-600">{event.description}</p>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/edit-event/${id}`}
            className="btn btn-outline flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Link>
          <button
            onClick={handleDeleteEvent}
            className="btn btn-outline text-red-600 hover:text-red-700 flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Event Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-body text-center">
            <Calendar className="mx-auto h-8 w-8 text-primary-600 mb-2" />
            <p className="text-sm text-gray-600">Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {/* {format(new Date(event?.date), 'MMM dd, yyyy')} */}
            </p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <Clock className="mx-auto h-8 w-8 text-green-600 mb-2" />
            <p className="text-sm text-gray-600">Time</p>
            <p className="text-lg font-semibold text-gray-900">{event?.time}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <MapPin className="mx-auto h-8 w-8 text-blue-600 mb-2" />
            <p className="text-sm text-gray-600">Location</p>
            <p className="text-lg font-semibold text-gray-900">{event?.location}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <Users className="mx-auto h-8 w-8 text-purple-600 mb-2" />
            <p className="text-sm text-gray-600">Category</p>
            <p className="text-lg font-semibold text-gray-900">{event?.category}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="card-header">
          <nav className="flex space-x-8">
            {tabs?.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab?.name}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="card-body">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Details</h3>
                <p className="text-gray-600">{event?.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Event Information</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Category:</dt>
                      <dd className="text-sm text-gray-900">{event?.category}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Privacy:</dt>
                      <dd className="text-sm text-gray-900">{event?.privacy}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Status:</dt>
                      <dd className="text-sm text-gray-900">
                        <span className={`badge ${
                          new Date(event?.date) > new Date() 
                            ? 'badge-success' 
                            : 'badge-warning'
                        }`}>
                          {new Date(event?.date) > new Date() ? 'Upcoming' : 'Past'}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Quick Stats</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Tickets Available:</dt>
                      <dd className="text-sm text-gray-900">{tickets.length}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Attendees:</dt>
                      <dd className="text-sm text-gray-900">{attendees.length}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Forum Posts:</dt>
                      <dd className="text-sm text-gray-900">{forums.length}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Active Polls:</dt>
                      <dd className="text-sm text-gray-900">{polls.length}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Event Tickets</h3>
                <button className="btn btn-primary flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Ticket</span>
                </button>
              </div>
              {tickets.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No tickets available for this event.</p>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{ticket.name}</h4>
                          <p className="text-sm text-gray-600">{ticket.description}</p>
                          <p className="text-sm text-gray-600">Quantity: {ticket.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">${ticket.price}</p>
                          <p className="text-sm text-gray-600">{ticket.type}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Attendees Tab */}
          {activeTab === 'attendees' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Attendees</h3>
              {attendees.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No attendees registered yet.</p>
              ) : (
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registration Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendees.map((attendee) => (
                        <tr key={attendee.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {attendee.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {attendee.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(attendee?.createdAt), 'MMM dd, yyyy')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Forums Tab */}
          {activeTab === 'forums' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Event Forums</h3>
                <button className="btn btn-primary flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>New Post</span>
                </button>
              </div>
              {forums.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No forum posts yet.</p>
              ) : (
                <div className="space-y-4">
                  {forums.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{post.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{post.content}</p>
                      <p className="text-xs text-gray-500">
                        Posted by {post.author} on {format(new Date(post.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Polls Tab */}
          {activeTab === 'polls' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Event Polls</h3>
                <button className="btn btn-primary flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Poll</span>
                </button>
              </div>
              {polls.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No polls created yet.</p>
              ) : (
                <div className="space-y-4">
                  {polls.map((poll) => (
                    <div key={poll.id} className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{poll.question}</h4>
                      <div className="space-y-2">
                        {poll.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input type="radio" name={`poll-${poll.id}`} id={`option-${index}`} />
                            <label htmlFor={`option-${index}`} className="text-sm text-gray-700">
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Q&A Tab */}
          {activeTab === 'qa' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Q&A Session</h3>
                <button className="btn btn-primary flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Ask Question</span>
                </button>
              </div>
              {qa.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No questions asked yet.</p>
              ) : (
                <div className="space-y-4">
                  {qa.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{item.question}</h4>
                      {item.answer && (
                        <div className="bg-gray-50 p-3 rounded mt-2">
                          <p className="text-sm text-gray-700">{item.answer}</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Asked by {item.author} on {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail; 
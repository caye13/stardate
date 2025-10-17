'use client'
import { api } from '@/lib/trpc/client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FaPlus, FaTimes, FaChevronDown, FaClock, FaExclamationCircle, FaTrash } from 'react-icons/fa'
import Link from 'next/link'

export default function Tasks() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All Departments')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    department: 'Engineering',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    description: '',
  })

  const departments = [
    'All Departments',
    'Engineering',
    'Command',
    'Operations',
    'Sciences',
    'Medical',
    'Security'
  ]

  const supabase = createClient()
  const utils = api.useUtils()
  const { data: userData } = api.auth.getUser.useQuery()

  // Fetch improvement orders with filters
  const { data: orders = [], isLoading } = api.improvementOrders.getImprovementOrders.useQuery({
    department: selectedDepartment !== 'All Departments' ? selectedDepartment : undefined,
  })

  // Mutations
  const toggleComplete = api.improvementOrders.toggleOrderComplete.useMutation({
    onSuccess: () => {
      utils.improvementOrders.getImprovementOrders.invalidate()
      utils.improvementOrders.getOrderStats.invalidate()
    },
  })

  const createOrder = api.improvementOrders.createAnalysisReport.useMutation({
    onSuccess: () => {
      utils.improvementOrders.getImprovementOrders.invalidate()
      utils.improvementOrders.getOrderStats.invalidate()
      setIsModalOpen(false)
      setNewTask({
        department: 'Engineering',
        severity: 'medium',
        description: '',
      })
    },
  })

  const deleteOrder = api.improvementOrders.deleteOrder.useMutation({
    onSuccess: () => {
      utils.improvementOrders.getImprovementOrders.invalidate()
      utils.improvementOrders.getOrderStats.invalidate()
    },
  })

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    utils.auth.getUser.invalidate()
  }

  const toggleTaskComplete = (orderId: string) => {
    toggleComplete.mutate({ id: orderId })
  }

  const addTask = () => {
    if (!newTask.description) return

    createOrder.mutate({
      rawOutput: JSON.stringify({
        createdAt: new Date().toISOString(),
        manualEntry: true
      }),
      orders: [newTask],
    })
  }

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Are you sure you want to delete this improvement order?')) {
      deleteOrder.mutate({ id: orderId })
    }
  }

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: { bg: '#E8F5E9', border: '#4CAF50', text: '#2E7D32' },
      medium: { bg: '#FFF3E0', border: '#FF9800', text: '#E65100' },
      high: { bg: '#FFEBEE', border: '#F44336', text: '#C62828' },
      critical: { bg: '#FCE4EC', border: '#E91E63', text: '#880E4F' }
    }
    return colors[severity as keyof typeof colors] || colors.medium
  }

  const getDepartmentColor = (dept: string) => {
    const colors: Record<string, string> = {
      'Engineering': '#FFD700',
      'Command': '#FF6B6B',
      'Operations': '#FFA500',
      'Sciences': '#4169E1',
      'Medical': '#00CED1',
      'Security': '#DC143C'
    }
    return colors[dept] || '#023020'
  }

  const Style = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
      
      body, #__next {
          font-family: 'Poppins', sans-serif;
          background-color: #ffffff;
          color: #1f2937;
          overflow-x: hidden;
      }

      .background-shape {
          position: fixed;
          border-radius: 50%;
          filter: blur(200px);
          opacity: 0.3;
          z-index: 0;
      }
      .shape1 {
          width: 500px;
          height: 500px;
          background: rgba(2, 48, 32, 0.4);
          top: -150px;
          left: -150px;
      }
      .shape2 {
          width: 400px;
          height: 400px;
          background: rgba(2, 48, 32, 0.3);
          bottom: -100px;
          right: -100px;
      }
      .shape3 {
          width: 350px;
          height: 350px;
          background: rgba(2, 48, 32, 0.25);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
      }

      .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 8px 32px 0 rgba(2, 48, 32, 0.1);
          transition: all 0.3s ease;
      }
      
      .glass-card:hover {
          background: rgba(255, 255, 255, 0.85);
          box-shadow: 0 8px 32px 0 rgba(2, 48, 32, 0.15);
      }
      
      .glossy-nav {
          background: linear-gradient(135deg, 
              rgba(255, 255, 255, 0.95) 0%,
              rgba(255, 255, 255, 0.85) 50%,
              rgba(255, 255, 255, 0.95) 100%);
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 1);
          box-shadow: 
              0 8px 32px 0 rgba(2, 48, 32, 0.15),
              0 2px 8px 0 rgba(255, 255, 255, 0.8) inset,
              0 -2px 8px 0 rgba(2, 48, 32, 0.05) inset;
      }

      .task-card {
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 4px 16px 0 rgba(2, 48, 32, 0.08);
          transition: all 0.3s ease;
      }
      
      .task-card:hover {
          background: rgba(255, 255, 255, 0.75);
          box-shadow: 0 8px 24px 0 rgba(2, 48, 32, 0.12);
          transform: translateY(-2px);
      }
      
      .task-card:hover .delete-button {
          opacity: 1;
      }
      
      .task-card-completed {
          opacity: 0.6;
          background: rgba(255, 255, 255, 0.4);
      }

      .delete-button {
          opacity: 0;
          transition: opacity 0.2s ease;
      }

      .glass-button {
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          transition: all 0.3s ease;
      }
      
      .glass-button:hover {
          background: rgba(255, 255, 255, 0.75);
          border-color: rgba(2, 48, 32, 0.3);
      }
      
      .glass-button-active {
          background: rgba(2, 48, 32, 0.2);
          border-color: rgba(2, 48, 32, 0.4);
          font-weight: 600;
      }

      .primary-button {
          background: linear-gradient(135deg, #023020 0%, #034d33 100%);
          color: white;
          transition: all 0.3s ease;
          font-weight: 500;
          border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(2, 48, 32, 0.3);
      }
      .primary-button:disabled {
          background: rgba(156, 163, 175, 0.5);
          cursor: not-allowed;
          transform: none;
      }

      .styled-textarea, .styled-select {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(2, 48, 32, 0.2);
          color: #023020;
          backdrop-filter: blur(10px);
      }
      .styled-textarea:focus, .styled-select:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(2, 48, 32, 0.3);
          border-color: #023020;
          background: rgba(255, 255, 255, 0.95);
      }

      .custom-checkbox {
          appearance: none;
          width: 24px;
          height: 24px;
          border: 2px solid rgba(2, 48, 32, 0.3);
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          position: relative;
          transition: all 0.3s ease;
          flex-shrink: 0;
      }
      
      .custom-checkbox:checked {
          background: linear-gradient(135deg, #023020 0%, #034d33 100%);
          border-color: #023020;
      }
      
      .custom-checkbox:checked::after {
          content: '';
          position: absolute;
          left: 7px;
          top: 3px;
          width: 6px;
          height: 12px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
      }

      .urgency-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          backdrop-filter: blur(10px);
      }
      
      .department-tag {
          padding: 3px 10px;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 600;
          backdrop-filter: blur(10px);
      }

      @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
      }
      .task-item {
          animation: fadeIn 0.3s ease-out forwards;
      }
    `}</style>
  )

  return (
    <>
      <Style />
      <div className="relative min-h-screen w-full">
        <div className="background-shape shape1"></div>
        <div className="background-shape shape2"></div>
        <div className="background-shape shape3"></div>

        {/* Top Navigation Bar */}
        <header className="fixed top-0 left-0 right-0 z-50 p-4">
          <div className="max-w-max mx-auto flex items-center gap-2 px-2 py-2 rounded-full glossy-nav">
            <Link href="/">
              <button
                className="px-4 py-2 rounded-full text-sm font-medium glass-button transition-all"
                style={{ color: '#4b5563' }}
              >
                Personal Logs
              </button>
            </Link>
            <Link href="/officers-log">
              <button
                className="px-4 py-2 rounded-full text-sm font-medium glass-button transition-all"
                style={{ color: '#4b5563' }}
              >
                Officers Logs
              </button>
            </Link>
            <button
              className="px-4 py-2 rounded-full text-sm font-medium glass-button-active transition-all"
              style={{ color: '#023020' }}
            >
              Improvement Orders
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-full text-sm font-medium glass-button transition-all"
              style={{ color: '#4b5563' }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Department Filter & Add Task */}
        <div className="fixed top-24 right-8 z-40 flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-5 py-3 rounded-xl glass-card flex items-center gap-2 text-sm font-medium"
              style={{ color: '#023020' }}
            >
              {selectedDepartment}
              <FaChevronDown size={12} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 rounded-xl glass-card overflow-hidden">
                {departments.map(dept => (
                  <button
                    key={dept}
                    onClick={() => {
                      setSelectedDepartment(dept)
                      setIsDropdownOpen(false)
                    }}
                    className="w-full px-5 py-3 text-left text-sm font-medium hover:bg-white/50 transition-all"
                    style={{
                      color: dept === selectedDepartment ? '#023020' : '#4b5563',
                      fontWeight: dept === selectedDepartment ? 600 : 500
                    }}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-12 h-12 flex items-center justify-center rounded-xl primary-button shadow-lg"
          >
            <FaPlus size={18} />
          </button>
        </div>

        {/* Main Content - Tasks Grid */}
        <main className="max-w-6xl mx-auto pt-32 px-6 pb-20 relative z-10">
          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">Loading improvement orders...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((order, index) => {
                const severityColors = getSeverityColor(order.severity)
                const isCompleted = order.status === 'completed'

                return (
                  <div
                    key={order.id}
                    className={`task-item task-card p-5 rounded-2xl ${isCompleted ? 'task-card-completed' : ''}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => toggleTaskComplete(order.id)}
                        className="custom-checkbox mt-1"
                        disabled={toggleComplete.isPending}
                      />

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <p className={`text-sm ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {order.description}
                          </p>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="delete-button ml-2 text-gray-400 hover:text-red-600 transition-colors"
                            disabled={deleteOrder.isPending}
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap mt-3">
                          <span
                            className="department-tag"
                            style={{
                              backgroundColor: `${getDepartmentColor(order.department)}20`,
                              color: getDepartmentColor(order.department),
                              border: `1px solid ${getDepartmentColor(order.department)}40`
                            }}
                          >
                            {order.department}
                          </span>

                          <span
                            className="urgency-badge"
                            style={{
                              backgroundColor: severityColors.bg,
                              color: severityColors.text,
                              border: `1px solid ${severityColors.border}40`
                            }}
                          >
                            <FaExclamationCircle size={10} />
                            {order.severity.charAt(0).toUpperCase() + order.severity.slice(1)}
                          </span>

                          <span className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!isLoading && orders.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">
                No improvement orders found for {selectedDepartment}
              </p>
            </div>
          )}
        </main>

        {/* New Task Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="w-full max-w-lg p-6 rounded-2xl glass-card relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"
              >
                <FaTimes size={20} />
              </button>

              <h2 className="text-2xl font-semibold mb-4" style={{ color: '#023020' }}>
                New Improvement Order
              </h2>

              <div className="space-y-3">
                <textarea
                  placeholder="Describe the improvement needed..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg styled-textarea"
                />

                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newTask.department}
                    onChange={(e) => setNewTask({ ...newTask, department: e.target.value })}
                    className="px-4 py-3 rounded-lg styled-select"
                  >
                    {departments.filter(d => d !== 'All Departments').map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>

                  <select
                    value={newTask.severity}
                    onChange={(e) => setNewTask({ ...newTask, severity: e.target.value as any })}
                    className="px-4 py-3 rounded-lg styled-select"
                  >
                    <option value="low">Low Severity</option>
                    <option value="medium">Medium Severity</option>
                    <option value="high">High Severity</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <button
                onClick={addTask}
                disabled={!newTask.description || createOrder.isPending}
                className="w-full py-3 rounded-lg primary-button mt-4"
              >
                {createOrder.isPending ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

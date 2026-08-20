// Campaign utility functions
export const getStatusBadgeConfig = (campaign) => {
  const statusConfig = {
    PENDING: {
      color: 'info',
      class: 'bg-blue-100 text-blue-800 border-blue-200',
      vuetifyColor: 'info',
      icon: 'mdi-clock-outline'
    },
    SCHEDULED: {
      color: 'purple',
      class: 'bg-purple-100 text-purple-800 border-purple-200',
      vuetifyColor: 'purple',
      icon: 'mdi-calendar-clock'
    },
    RUNNING: {
      color: 'warning', 
      class: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      vuetifyColor: 'warning',
      icon: 'mdi-play-circle-outline'
    },
    IN_PROGRESS: {
      color: 'warning',
      class: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      vuetifyColor: 'warning',
      icon: 'mdi-progress-clock'
    },
    COMPLETED: {
      color: 'success',
      class: 'bg-green-100 text-green-800 border-green-200',
      vuetifyColor: 'success', 
      icon: 'mdi-check-circle-outline'
    },
    FAILED: {
      color: 'error',
      class: 'bg-red-100 text-red-800 border-red-200',
      vuetifyColor: 'error',
      icon: 'mdi-alert-circle-outline'  
    },
    CANCELLED: {
      color: 'warning',
      class: 'bg-gray-100 text-gray-800 border-gray-200',
      vuetifyColor: 'secondary',
      icon: 'mdi-cancel'
    },
    PAUSED: {
      color: 'info',
      class: 'bg-blue-100 text-blue-800 border-blue-200', 
      vuetifyColor: 'info',
      icon: 'mdi-pause-circle-outline'
    }
  }

  // Use backend provided config if available, fallback to local config
  const status = campaign.status
  const backendColor = campaign.status_color
  const backendDisplay = campaign.status_display
  
  const config = statusConfig[status] || statusConfig.PENDING
  
  return {
    ...config,
    // Use backend values if provided
    color: backendColor || config.color,
    display: backendDisplay || status,
    vuetifyColor: backendColor || config.vuetifyColor
  }
}

export const formatSuccessPercentage = (campaign) => {
  if (!campaign.total_recipients || campaign.total_recipients === 0) {
    return '0%'
  }
  
  // Use backend calculated percentage if available
  if (campaign.success_percentage !== undefined) {
    const percentage = parseFloat(campaign.success_percentage)
    return `${percentage.toFixed(1)}%`
  }
  
  // Fallback calculation
  const percentage = ((campaign.sent_count || 0) / campaign.total_recipients) * 100
  return `${percentage.toFixed(1)}%`
}

export const getProgressColor = (percentage) => {
  if (percentage >= 80) return 'success'
  if (percentage >= 50) return 'warning'  
  return 'error'
}

export const formatCampaignDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) {
    return 'Hoy'
  } else if (diffDays === 2) {
    return 'Ayer'
  } else if (diffDays <= 7) {
    return `Hace ${diffDays - 1} días`
  } else {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    })
  }
}

export const getCampaignTypeIcon = (campaign) => {
  // Determine campaign type based on data
  if (campaign.groupIds?.length > 0 || campaign.type === 'groups') {
    return 'mdi-account-group'
  } else if (campaign.type === 'contacts') {
    return 'mdi-account'
  } else if (campaign.type === 'mixed') {
    return 'mdi-account-multiple'
  } else {
    return 'mdi-message-text'
  }
}
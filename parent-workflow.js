(function() {
    var STORAGE_KEY = 'dt_parent_workflow_data_v1';
    var WORKFLOW_STAGES = [
        { id: 'request-submitted', name: 'Request Submitted', order: 1 },
        { id: 'under-review', name: 'Under Review', order: 2 },
        { id: 'approved', name: 'Approved', order: 3 },
        { id: 'rejected', name: 'Rejected', order: 4 },
        { id: 'completed', name: 'Completed', order: 5 }
    ];

    var DEFAULT_DATA = {
        parents: [
            { id: 'p1', name: 'Ananya Shah', email: 'ananya.shah@mail.com', city: 'Mumbai', registeredAt: '2026-06-01' },
            { id: 'p2', name: 'Ravi Kumar', email: 'ravi.kumar@mail.com', city: 'Delhi', registeredAt: '2026-06-05' },
            { id: 'p3', name: 'Meera Patel', email: 'meera.patel@mail.com', city: 'Ahmedabad', registeredAt: '2026-06-07' },
            { id: 'p4', name: 'Priya Nair', email: 'priya.nair@mail.com', city: 'Bengaluru', registeredAt: '2026-06-09' },
            { id: 'p5', name: 'Siddharth Varma', email: 'siddharth.varma@mail.com', city: 'Pune', registeredAt: '2026-06-11' }
        ],
        requests: [
            { id: 'req-1', parentId: 'p1', title: 'Request orientation session for Grade 10 parents', status: 'Pending Review', submittedAt: '2026-06-11', updatedAt: '2026-06-11', percent: 18 },
            { id: 'req-2', parentId: 'p2', title: 'Approval for extra class support', status: 'Under Review', submittedAt: '2026-06-10', updatedAt: '2026-06-11', percent: 45 },
            { id: 'req-3', parentId: 'p3', title: 'Complete profile verification', status: 'Approved', submittedAt: '2026-06-09', updatedAt: '2026-06-10', percent: 74 },
            { id: 'req-4', parentId: 'p4', title: 'Rejection appeal for career counselling slot', status: 'Rejected', submittedAt: '2026-06-08', updatedAt: '2026-06-09', percent: 100 },
            { id: 'req-5', parentId: 'p5', title: 'Request completed for school follow-up meeting', status: 'Completed', submittedAt: '2026-06-05', updatedAt: '2026-06-07', percent: 100 },
            { id: 'req-6', parentId: 'p1', title: 'Add support for new subject planner', status: 'Under Review', submittedAt: '2026-06-07', updatedAt: '2026-06-08', percent: 52 },
            { id: 'req-7', parentId: 'p2', title: 'Request approval for workshop invite', status: 'Request Submitted', submittedAt: '2026-06-12', updatedAt: '2026-06-12', percent: 12 }
        ],
        workflow_logs: [
            { id: 'log-1', workflowId: 'req-1', status: 'Request Submitted', note: 'Parent submitted a new orientation request.', timestamp: '2026-06-11T09:30:00Z' },
            { id: 'log-2', workflowId: 'req-2', status: 'Under Review', note: 'Reviewers started evaluation for extra class support.', timestamp: '2026-06-11T10:15:00Z' },
            { id: 'log-3', workflowId: 'req-3', status: 'Approved', note: 'Profile verification approved and forwarded to operations.', timestamp: '2026-06-10T14:30:00Z' },
            { id: 'log-4', workflowId: 'req-4', status: 'Rejected', note: 'Appeal denied due to missing documents.', timestamp: '2026-06-09T11:12:00Z' },
            { id: 'log-5', workflowId: 'req-5', status: 'Completed', note: 'Meeting completed successfully.', timestamp: '2026-06-07T16:45:00Z' },
            { id: 'log-6', workflowId: 'req-6', status: 'Under Review', note: 'Support request is being validated by the team.', timestamp: '2026-06-08T09:00:00Z' },
            { id: 'log-7', workflowId: 'req-7', status: 'Request Submitted', note: 'Workshop invite request has been logged.', timestamp: '2026-06-12T12:05:00Z' }
        ],
        notifications: [
            { id: 'n1', type: 'New Request', title: 'New request submitted', message: 'A parent has submitted a new support request.', timestamp: '2026-06-12T12:05:00Z', read: false },
            { id: 'n2', type: 'Approval', title: 'Request approved', message: 'A request has been approved and is ready for next action.', timestamp: '2026-06-10T14:30:00Z', read: false },
            { id: 'n3', type: 'Rejection', title: 'Request rejected', message: 'A request was rejected due to missing documents.', timestamp: '2026-06-09T11:12:00Z', read: true },
            { id: 'n4', type: 'Completion', title: 'Request completed', message: 'One of the parent workflows was completed successfully.', timestamp: '2026-06-07T16:45:00Z', read: true }
        ]
    };

    var state = loadStore();

    function loadStore() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                return JSON.parse(raw);
            }
        } catch (e) {
            console.warn('Parent workflow load failed', e);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
        return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }

    function saveStore() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Parent workflow save failed', e);
        }
    }

    function getStatusClass(status) {
        var key = status.toLowerCase().replace(/\s+/g, '-');
        if (key === 'completed') return 'status-completed';
        if (key === 'in-progress' || key === 'under-review') return 'status-in-progress';
        if (key === 'rejected') return 'status-rejected';
        if (key === 'pending-review' || key === 'request-submitted') return 'status-pending-review';
        return 'status-pending-review';
    }

    function escapeHTML(value) {
        if (typeof value !== 'string') return value;
        return value.replace(/[&<>"']/g, function(chr) {
            return {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[chr];
        });
    }

    function DashboardCard(label, value, note) {
        return '<div class="dashboard-card"><div class="card-title">' + escapeHTML(label) + '</div>' +
            '<div class="card-value">' + escapeHTML(String(value)) + '</div>' +
            '<div class="card-note">' + escapeHTML(note) + '</div></div>';
    }

    function StatusBadge(status) {
        return '<span class="status-badge ' + getStatusClass(status) + '">' + escapeHTML(status) + '</span>';
    }

    function WorkflowProgressBar(percent) {
        var safe = Math.min(100, Math.max(0, percent));
        return '<div class="progress-label"><span>' + escapeHTML(String(safe)) + '% progress</span><span>' +
            escapeHTML(getStageLabelFromPercent(safe)) + '</span></div>' +
            '<div class="progress-bar"><div class="progress-fill" style="width:' + safe + '%"></div></div>';
    }

    function getStageLabelFromPercent(percent) {
        if (percent >= 100) return 'Completed';
        if (percent >= 75) return 'Approved';
        if (percent >= 45) return 'Under Review';
        if (percent > 0) return 'Request Submitted';
        return 'Pending Review';
    }

    function ActivityTimeline(items) {
        return items.map(function(item) {
            return '<li class="timeline-item"><span class="timeline-dot"></span><div><strong>' +
                escapeHTML(item.status) + '</strong><div class="timeline-copy">' + escapeHTML(item.note) + '</div>' +
                '<div class="timeline-copy" style="font-size:0.82rem; color:rgba(255,255,255,0.55); margin-top:0.45rem;">' +
                escapeHTML(new Date(item.timestamp).toLocaleString()) + '</div></div></li>';
        }).join('');
    }

    function NotificationPanel(items) {
        return items.map(function(item) {
            return '<li class="notification-item"><span class="notification-dot"></span><div><strong>' +
                escapeHTML(item.title) + '</strong><div class="timeline-copy">' + escapeHTML(item.message) + '</div>' +
                '<div class="timeline-copy" style="font-size:0.82rem; color:rgba(255,255,255,0.55); margin-top:0.35rem;">' +
                escapeHTML(new Date(item.timestamp).toLocaleString()) + '</div></div></li>';
        }).join('');
    }

    function WorkflowTracker(request) {
        return '<div class="workflow-card">' +
            '<div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:1rem; align-items:flex-start;">' +
            '<div><h4>' + escapeHTML(request.title) + '</h4>' +
            '<div class="status-badge ' + getStatusClass(request.status) + '">' + escapeHTML(request.status) + '</div></div>' +
            '<div style="text-align:right; color:var(--mu); font-size:0.95rem;">ID: ' + escapeHTML(request.id) + '</div>' +
            '</div>' +
            '<div style="margin-top:0.75rem; color:var(--mu); font-size:0.95rem;">Parent: ' + escapeHTML(getParentName(request.parentId)) + '</div>' +
            WorkflowProgressBar(request.percent) +
            '<div style="display:flex; gap:0.75rem; flex-wrap:wrap; margin-top:1rem;">' +
            '<button class="btn btn-out" type="button" onclick="showWorkflowDetail(\'' + request.id + '\')">View Details</button>' +
            '<button class="btn btn-out" type="button" onclick="updateWorkflowStatus(\'' + request.id + '\', \'Completed\')" style="background: var(--green); border-color: rgba(52,215,124,0.2); color: #000;">Mark Complete</button>' +
            '</div></div>';
    }

    function getParentName(parentId) {
        var parent = state.parents.find(function(item) {
            return item.id === parentId;
        });
        return parent ? parent.name : 'Unknown Parent';
    }

    function showPage(id) {
        document.querySelectorAll('.page').forEach(function(page) {
            page.classList.remove('active');
        });
        var page = document.getElementById(id);
        if (page) {
            page.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function openParentWorkflow() {
        showPage('page-parent-workflow');
        renderParentWorkflow();
    }

    function renderParentWorkflow() {
        renderMetrics();
        renderStatsCharts();
        renderWorkflowTrackers();
        renderRecentActivities();
        renderNotifications();
    }

    function renderMetrics() {
        var totalParents = state.parents.length;
        var activeRequests = state.requests.filter(function(r) {
            return r.status === 'Request Submitted' || r.status === 'Under Review' || r.status === 'Approved';
        }).length;
        var completedRequests = state.requests.filter(function(r) {
            return r.status === 'Completed';
        }).length;
        var pendingApprovals = state.requests.filter(function(r) {
            return r.status === 'Pending Review';
        }).length;
        var html = '';
        html += DashboardCard('Total Parents Registered', totalParents, 'Parents registered in the workflow system.');
        html += DashboardCard('Active Requests', activeRequests, 'Requests currently being processed.');
        html += DashboardCard('Completed Requests', completedRequests, 'Workflows that have reached completion.');
        html += DashboardCard('Pending Approvals', pendingApprovals, 'Requests waiting for review and approval.');
        var container = document.getElementById('parent-workflow-metrics');
        if (container) container.innerHTML = html;
    }

    function renderStatsCharts() {
        var totalRequests = state.requests.length;
        var activeRequests = state.requests.filter(function(r) {
            return ['Request Submitted', 'Under Review', 'Approved'].includes(r.status);
        }).length;
        var completedRequests = state.requests.filter(function(r) {
            return r.status === 'Completed';
        }).length;
        var pendingRequests = state.requests.filter(function(r) {
            return r.status === 'Pending Review';
        }).length;
        var chartData = [
            { label: 'Total Requests', value: totalRequests, percent: 100 },
            { label: 'Active Requests', value: activeRequests, percent: totalRequests ? Math.round(activeRequests / totalRequests * 100) : 0 },
            { label: 'Completed Requests', value: completedRequests, percent: totalRequests ? Math.round(completedRequests / totalRequests * 100) : 0 },
            { label: 'Pending Requests', value: pendingRequests, percent: totalRequests ? Math.round(pendingRequests / totalRequests * 100) : 0 }
        ];
        var html = chartData.map(function(item) {
            return '<div class="chart-bar"><div class="label"><strong>' + escapeHTML(item.label) + '</strong> · ' +
                escapeHTML(String(item.value)) + '</div><div class="bar-wrap"><div class="bar-fill" style="width:' +
                escapeHTML(String(item.percent)) + '%"></div></div></div>';
        }).join('');
        var container = document.getElementById('workflow-stat-charts');
        if (container) container.innerHTML = html;
    }

    function renderWorkflowTrackers() {
        var trackers = state.requests.slice().sort(function(a, b) {
            return getStageOrder(b.status) - getStageOrder(a.status) || new Date(b.updatedAt) - new Date(a.updatedAt);
        }).slice(0, 4);
        var html = trackers.map(function(request) {
            return WorkflowTracker(request);
        }).join('');
        var container = document.getElementById('workflow-tracker-list');
        if (container) container.innerHTML = html;
    }

    function getStageOrder(status) {
        var stage = WORKFLOW_STAGES.find(function(item) {
            return item.name === status || item.id === status.toLowerCase().replace(/\s+/g, '-');
        });
        return stage ? stage.order : 0;
    }

    function renderRecentActivities() {
        var activityEntries = state.workflow_logs.slice().sort(function(a, b) {
            return new Date(b.timestamp) - new Date(a.timestamp);
        }).slice(0, 6);
        var container = document.getElementById('recent-activities');
        if (container) container.innerHTML = ActivityTimeline(activityEntries);
    }

    function renderNotifications() {
        var items = state.notifications.slice().sort(function(a, b) {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        var container = document.getElementById('notification-panel');
        if (container) container.innerHTML = NotificationPanel(items);
    }

    function getWorkflowById(id) {
        return state.requests.find(function(item) {
            return item.id === id;
        });
    }

    function getWorkflowLogs(id) {
        return state.workflow_logs.filter(function(log) {
            return log.workflowId === id;
        }).sort(function(a, b) {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
    }

    function updateWorkflowStatus(id, nextStatus) {
        var workflow = getWorkflowById(id);
        if (!workflow) {
            if (typeof showToast === 'function') showToast('⚠️', 'Workflow request not found.');
            return;
        }
        workflow.status = nextStatus;
        workflow.percent = nextStatus === 'Completed' ? 100 : Math.min(90, workflow.percent + 25);
        workflow.updatedAt = new Date().toISOString();
        state.workflow_logs.unshift({
            id: 'log-' + Math.random().toString(36).slice(2, 10),
            workflowId: workflow.id,
            status: nextStatus,
            note: 'Status updated to ' + nextStatus + '.',
            timestamp: new Date().toISOString()
        });
        state.notifications.unshift({
            id: 'n' + Math.random().toString(36).slice(2, 10),
            type: nextStatus === 'Completed' ? 'Completion' : nextStatus === 'Rejected' ? 'Rejection' : 'Approval',
            title: nextStatus + ' update',
            message: 'Workflow "' + workflow.title + '" moved to ' + nextStatus + '.',
            timestamp: new Date().toISOString(),
            read: false
        });
        saveStore();
        renderParentWorkflow();
        if (typeof showToast === 'function') showToast('✅', 'Workflow updated to ' + nextStatus + '.');
    }

    function showWorkflowDetail(id) {
        var workflow = getWorkflowById(id);
        if (!workflow) {
            if (typeof showToast === 'function') showToast('⚠️', 'Workflow details unavailable.');
            return;
        }
        var logs = getWorkflowLogs(id);
        var modalContent = '<div style="padding:1.5rem; color:#edf6ff; font-family:inherit;">' +
            '<h2 style="margin:0 0 0.75rem;">' + escapeHTML(workflow.title) + '</h2>' +
            '<div style="margin-bottom:0.75rem; color:var(--mu);">Parent: ' + escapeHTML(getParentName(workflow.parentId)) + '</div>' +
            '<div style="margin-bottom:1rem;">Status: ' + StatusBadge(workflow.status) + '</div>' +
            '<div style="margin-bottom:1rem;">Progress: ' + escapeHTML(String(workflow.percent)) + '%</div>' +
            '<div style="margin-top:1rem;"><strong>Workflow history</strong></div>' +
            '<ul style="margin:0; padding-left:1.2rem; color:var(--wh2); font-size:0.95rem;">' +
            logs.map(function(log) {
                return '<li style="margin-bottom:0.8rem;"><strong>' + escapeHTML(log.status) + '</strong> — ' +
                    escapeHTML(log.note) + ' <span style="display:block;color:rgba(255,255,255,0.55);font-size:0.82rem;">' +
                    escapeHTML(new Date(log.timestamp).toLocaleString()) + '</span></li>';
            }).join('') + '</ul></div>';
        var detailWindow = window.open('', '_blank', 'width=520,height=680');
        if (detailWindow) {
            detailWindow.document.write('<!DOCTYPE html><html><head><title>Workflow Details</title>' +
                '<style>body{font-family:Plus Jakarta Sans, sans-serif;background:#050b17;color:#edf6ff;padding:1.5rem;}h2{margin-bottom:0.6rem;}button{margin-top:1rem;padding:.85rem 1.25rem;border:none;border-radius:999px;background:#34d77c;color:#000;font-weight:700;cursor:pointer;}</style>' +
                '</head><body>' + modalContent + '<button onclick="window.close()">Close</button></body></html>');
            detailWindow.document.close();
            return;
        }
        alert('Workflow details: ' + workflow.title);
    }

    function getDashboardApiResponse() {
        var totalRequests = state.requests.length;
        var activeRequests = state.requests.filter(function(r) {
            return ['Request Submitted', 'Under Review', 'Approved'].includes(r.status);
        }).length;
        var completedRequests = state.requests.filter(function(r) {
            return r.status === 'Completed';
        }).length;
        var pendingRequests = state.requests.filter(function(r) {
            return r.status === 'Pending Review';
        }).length;
        return {
            totalParents: state.parents.length,
            activeRequests: activeRequests,
            completedRequests: completedRequests,
            pendingApprovals: pendingRequests,
            stats: {
                totalRequests: totalRequests,
                activeRequests: activeRequests,
                completedRequests: completedRequests,
                pendingRequests: pendingRequests
            }
        };
    }

    function interceptApiRequests() {
        if (!window.fetch) return;
        var nativeFetch = window.fetch.bind(window);
        window.fetch = function(input, init) {
            try {
                var requestUrl = typeof input === 'string' ? input : input.url;
                var url = new URL(requestUrl, window.location.origin);
                if (url.pathname === '/api/dashboard/stats') {
                    var stats = getDashboardApiResponse();
                    return Promise.resolve(new Response(JSON.stringify(stats), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    }));
                }
                if (url.pathname.startsWith('/api/workflow/')) {
                    var pathParts = url.pathname.split('/').filter(Boolean);
                    var workflowId = pathParts[2];
                    if (init && init.method && init.method.toUpperCase() === 'PUT' && pathParts[3] === 'status') {
                        return new Promise(function(resolve) {
                            parseJsonBody(input, init).then(function(body) {
                                updateWorkflowStatus(workflowId, body.status || 'Completed');
                                var result = { success: true, workflow: getWorkflowById(workflowId) };
                                resolve(new Response(JSON.stringify(result), {
                                    status: 200,
                                    headers: { 'Content-Type': 'application/json' }
                                }));
                            }).catch(function() {
                                resolve(new Response(JSON.stringify({ error: 'Invalid update payload.' }), { status: 400, headers: { 'Content-Type': 'application/json' } }));
                            });
                        });
                    }
                    if (pathParts[3] === 'logs') {
                        var logs = getWorkflowLogs(workflowId);
                        return Promise.resolve(new Response(JSON.stringify({ logs: logs }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
                    }
                    var workflow = getWorkflowById(workflowId);
                    if (workflow) {
                        return Promise.resolve(new Response(JSON.stringify({ workflow: workflow }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
                    }
                }
            } catch (e) {
                console.warn('Mock API intercept error', e);
            }
            return nativeFetch(input, init);
        };
    }

    function parseJsonBody(input, init) {
        return new Promise(function(resolve, reject) {
            if (init && init.body) {
                try {
                    var body = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
                    resolve(body);
                } catch (e) {
                    reject(e);
                }
                return;
            }
            if (typeof input === 'object' && input.clone) {
                input.clone().text().then(function(text) {
                    try {
                        resolve(JSON.parse(text));
                    } catch (err) {
                        resolve({});
                    }
                }).catch(function() {
                    resolve({});
                });
                return;
            }
            resolve({});
        });
    }

    function initParentWorkflowModule() {
        window.openParentWorkflow = openParentWorkflow;
        window.showWorkflowDetail = showWorkflowDetail;
        window.updateWorkflowStatus = updateWorkflowStatus;
        interceptApiRequests();
        if (window.location.hash === '#parent-workflow') {
            openParentWorkflow();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initParentWorkflowModule);
    } else {
        initParentWorkflowModule();
    }
})();
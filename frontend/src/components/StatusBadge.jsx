import React from 'react';
import { cn } from '../lib/utils';
import { CheckCircle2, AlertCircle, CircleDashed, Clock, FlaskConical, Users, Eye } from 'lucide-react';

export default function StatusBadge({ status, className }) {
    let styles = "bg-zinc-800/80 text-zinc-400 border-zinc-700/50";
    let Icon = CircleDashed;

    switch (status) {
        // Release / checklist states
        case 'Done':
        case 'Completed':
        case 'Live':
            styles = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            Icon = CheckCircle2;
            break;
        case 'In Review':
            styles = "bg-violet-500/10 text-violet-400 border-violet-500/20";
            Icon = Eye;
            break;
        case 'Waiting for Review':
            styles = "bg-amber-500/10 text-amber-400 border-amber-500/20";
            Icon = Clock;
            break;
        case 'In Closed Testing':
            styles = "bg-violet-500/10 text-violet-400 border-violet-500/20";
            Icon = Users;
            break;
        case 'In Internal Testing':
            styles = "bg-sky-500/10 text-sky-400 border-sky-500/20";
            Icon = FlaskConical;
            break;
        case 'Pending':
        case 'Testing':
        case 'Remaining':
            styles = "bg-amber-500/10 text-amber-400 border-amber-500/20";
            Icon = Clock;
            break;
        case 'Rejected':
        case 'Attention':
            styles = "bg-red-500/10 text-red-400 border-red-500/20";
            Icon = AlertCircle;
            break;
        default:
            break;
    }

    return (
        <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border", styles, className)}>
            <Icon size={12} />
            {status}
        </span>
    );
}


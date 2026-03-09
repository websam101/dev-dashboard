<!--
  Copyright (C) 2025-2026 Sam <websam101@gmail.com>

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->
# System Monitoring

Track your host machine's performance in real-time to identify bottlenecks or resource conflicts.

## ðŸ“Š Resource Indicators
The dashboard displays three primary monitors:
1. **CPU:** Total load percentage across all your cores. On Windows, we use a smart proxy to provide a meaningful load metric.
2. **RAM:** Active memory usage in GB and percentage.
3. **Disk:** Space used on your primary partition (typically `C:` or `/`).

## ðŸ“¡ Network Traffic
Visualize the cumulative data sent and received since the last system boot. Useful for checking if a project is consuming bandwidth unexpectedly.

## ðŸ–¥ï¸ Task Manager
A **Monitor** icon is available in the dashboard header. Clicking it instantly opens your system's native tool:
- **Windows:** Task Manager (`taskmgr.exe`).
- **macOS:** Activity Monitor.
- **Linux:** GNOME System Monitor (or equivalent).

## âš™ï¸ Configuration
You can customize the monitoring display in [Settings](./README.md#settings):
- **Show Statistics:** Toggle the monitors on or off to free up visual space or save resources.
- **Auto-check Ports:** Allow the app to periodically scan your projects' network ports in the background.

---

_Back to [User Guide](./README.md)_

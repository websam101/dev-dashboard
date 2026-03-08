# System Monitoring

Track your host machine's performance in real-time to identify bottlenecks or resource conflicts.

## 📊 Resource Indicators
The dashboard displays three primary monitors:
1. **CPU:** Total load percentage across all your cores. On Windows, we use a smart proxy to provide a meaningful load metric.
2. **RAM:** Active memory usage in GB and percentage.
3. **Disk:** Space used on your primary partition (typically `C:` or `/`).

## 📡 Network Traffic
Visualize the cumulative data sent and received since the last system boot. Useful for checking if a project is consuming bandwidth unexpectedly.

## 🖥️ Task Manager
A **Monitor** icon is available in the dashboard header. Clicking it instantly opens your system's native tool:
- **Windows:** Task Manager (`taskmgr.exe`).
- **macOS:** Activity Monitor.
- **Linux:** GNOME System Monitor (or equivalent).

## ⚙️ Configuration
You can customize the monitoring display in [Settings](./README.md#settings):
- **Show Statistics:** Toggle the monitors on or off to free up visual space or save resources.
- **Auto-check Ports:** Allow the app to periodically scan your projects' network ports in the background.

---

_Back to [User Guide](./README.md)_

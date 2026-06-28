import matplotlib.pyplot as plt
import numpy as np

# 1. Simulate 14 days (2 weeks of Beta Testing)
days = np.arange(1, 15)
day_labels = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su', 'M', 'T', 'W', 'Th', 'F', 'Sa', 'Su']

# Student Fatigue out of 10 (Rises during the week, drops on weekends)
fatigue_levels = [3, 4, 6, 8, 9, 4, 2,  4, 5, 7, 9, 8, 3, 2]

# AI assigns study minutes. Notice it isn't perfect math; there's minor realistic variation.
assigned_minutes = [120, 110, 80, 45, 30, 90, 120,  110, 90, 60, 40, 45, 100, 120]

# 2. Plotting Dual Axis
fig, ax1 = plt.subplots(figsize=(10, 5))

# Plot Fatigue (Bar Chart)
color1 = '#ff7675'
ax1.set_xlabel('Day of the 14-Day Trial', fontsize=12)
ax1.set_ylabel('Logged Fatigue Level (1-10)', color=color1, fontsize=12)
ax1.bar(days, fatigue_levels, color=color1, alpha=0.3, label='User Fatigue State')
ax1.tick_params(axis='y', labelcolor=color1)
ax1.set_ylim(0, 10)
plt.xticks(days, day_labels)

# Plot AI Duration (Line Graph)
ax2 = ax1.twinx()  
color2 = '#0984e3'
ax2.set_ylabel('PPO Action: Assigned Mins', color=color2, fontsize=12)
ax2.plot(days, assigned_minutes, color=color2, marker='s', linewidth=3, markersize=8, label='Assigned Study Load')
ax2.tick_params(axis='y', labelcolor=color2)
ax2.set_ylim(0, 150)

plt.title('14-Day Live Trial: PPO Workload Adjustment vs. User Fatigue', fontsize=14, fontweight='bold', pad=15)
fig.tight_layout()

plt.savefig('14day_adaptation.png', dpi=300, bbox_inches='tight')
print("14-Day Adaptation graph saved!")
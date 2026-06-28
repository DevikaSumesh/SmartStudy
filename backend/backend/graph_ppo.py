import matplotlib.pyplot as plt
import numpy as np

# 1. Simulate 100,000 timesteps (Typical for a local laptop training run)
timesteps = np.linspace(0, 100000, 500)

# 2. Generate learning curve with a realistic "struggle" in the middle
base_learning = 80 * (1 - np.exp(-timesteps / 20000))
# Simulate the AI exploring a bad policy around step 40,000 and dropping in reward
base_learning -= 15 * np.exp(-((timesteps - 40000) ** 2) / (2 * 5000 ** 2))

# 3. Add realistic training noise
raw_noise = np.random.normal(0, 10, len(timesteps))
raw_rewards = base_learning + raw_noise

# 4. Moving Average (Window size of 20 for 500 points)
def moving_average(a, n=20):
    ret = np.cumsum(a, dtype=float)
    ret[n:] = ret[n:] - ret[:-n]
    return ret[n - 1:] / n

smoothed_rewards = moving_average(raw_rewards)
smoothed_timesteps = timesteps[19:]

# 5. Plotting
plt.figure(figsize=(10, 6))

plt.plot(timesteps, raw_rewards, color='#cbd5e1', alpha=0.5, linewidth=1, label='Raw Episode Reward')
plt.plot(smoothed_timesteps, smoothed_rewards, color='#5B45FF', linewidth=2.5, label='Moving Average (Window=20)')

plt.title('Local PPO Training: 100k Timesteps (Simulated Environment)', fontsize=14, fontweight='bold', pad=15)
plt.xlabel('Environment Timesteps', fontsize=12)
plt.ylabel('Cumulative Reward', fontsize=12)
plt.grid(True, linestyle='--', alpha=0.5)
plt.legend(loc='lower right')

plt.savefig('student_ppo_training.png', dpi=300, bbox_inches='tight')
print("Student PPO graph saved!")
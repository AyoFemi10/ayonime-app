import AsyncStorage from "@react-native-async-storage/async-storage";

const MY_JOBS_KEY = "ayonime_my_job_ids";

export async function getMyJobIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(MY_JOBS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function saveMyJobId(jobId: string) {
  try {
    const ids = await getMyJobIds();
    if (!ids.includes(jobId)) {
      ids.push(jobId);
      await AsyncStorage.setItem(MY_JOBS_KEY, JSON.stringify(ids));
    }
  } catch {}
}

export async function removeMyJobId(jobId: string) {
  try {
    const ids = (await getMyJobIds()).filter((id) => id !== jobId);
    await AsyncStorage.setItem(MY_JOBS_KEY, JSON.stringify(ids));
  } catch {}
}

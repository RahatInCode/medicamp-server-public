import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const deleteCamp = async (campId, token) => {
  return axios.delete(`https://medicamp-server-five.vercel.app/camps/delete-camp/${campId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export function useDeleteCamp(token) {
  const queryClient = useQueryClient();

  return useMutation(
    (campId) => deleteCamp(campId, token),
    {
      onSuccess: () => {
        // Invalidate & refetch camps list after deletion
        queryClient.invalidateQueries(['camps']);
      },
      onError: (error) => {
        console.error('Delete failed:', error);
      },
    }
  );
}

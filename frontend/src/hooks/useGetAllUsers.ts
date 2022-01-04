import { useInjection } from 'inversify-react';
import { useEffect, useState } from 'react';
import { HttpStatus } from '../enum/http-status.enum';
import { User } from '../models/user';
import { PlainClassConverter } from '../ports/PlainClassConverter';
import { UserService } from '../ports/services/UserService';
import { TYPES } from '../types/InversifyTypes';

export const useGetAllUsers = () => {
  const _userService = useInjection<UserService>(TYPES.UserService);
  const _plainClassConverter = useInjection<PlainClassConverter>(
    TYPES.PlainClassConverter
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, status } = await _userService.usersList();
      if (status === HttpStatus.OK) {
        setUsers(_plainClassConverter.plainToClassArray(User, data));
        setLoading(false);
      }
    };
    fetchData();
  }, [_userService, _plainClassConverter]);

  return { loading, users };
};

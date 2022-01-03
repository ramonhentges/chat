import { inject, injectable } from 'inversify';
import { AddRemoveUserToGroupDto } from '../../dto/add-user-to-group';
import { CreateGroupDto } from '../../dto/create-group';
import { GroupService } from '../../ports/services/GroupService';
import { HttpService } from '../../ports/services/HttpService';
import { TYPES } from '../../types/InversifyTypes';

@injectable()
export class GroupServiceImpl implements GroupService {
  @inject(TYPES.HttpService) private _httpService: HttpService;

  createGroup = (group: CreateGroupDto) =>
    this._httpService.post(`groups`, group);

  updateGroup = (groupId: string, group: CreateGroupDto) =>
    this._httpService.put(`groups/${groupId}`, group);

  addUser = (userGroup: AddRemoveUserToGroupDto) =>
    this._httpService.post(`groups/add-user`, userGroup);

  removeUser = (userGroup: AddRemoveUserToGroupDto) =>
    this._httpService.delete(
      `groups/remove-user/${userGroup.groupId}/${userGroup.username}`
    );

  deleteGroup = (groupId: string) =>
    this._httpService.delete(`groups/${groupId}`);

  getMyGroups = () => this._httpService.get('groups');

  getGroupInfo = (groupId: string) =>
    this._httpService.get(`groups/${groupId}`);
}

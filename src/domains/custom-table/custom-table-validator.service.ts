import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TableViz } from "../table-viz/entities/table-viz.entity";
import { In, Repository } from "typeorm";

@Injectable()
export class CustomTableValidatorService {

  constructor(
    @InjectRepository(TableViz)
    private _tableVizRepository: Repository<TableViz>
  ) { }

  /**
   * Valid user permission based on table name and action.
   * 
   * @param tableName The table name.
   * @param action The action.
   * @param userNavigationPermissionsArray The user navigation permissions.
   * @throws {ForbiddenException} If user doesn't have correct permission on navigaton linked to table name.
   */
  async validPermission(
    tableName: string,
    action: 'view' | 'add' | 'edit' | 'delete',
    userNavigationPermissionsArray: Array<{
      navigationId: string;
      permissionName: string;
      navigationTypeName: string;
    }>
  ) {
    if (action !== 'view') {
      userNavigationPermissionsArray = userNavigationPermissionsArray
        .filter(obj => obj.permissionName.includes(action));
    }

    const navigationIdsRelatedToAction = userNavigationPermissionsArray
      .map<string>(obj => obj.navigationId);

    const tableVizRecord = await this._tableVizRepository.findOne({
      where: {
        tableName: tableName,
        navigationId: In(navigationIdsRelatedToAction)
      }
    });

    if (!tableVizRecord) {
      throw new ForbiddenException();
    }
  }
}
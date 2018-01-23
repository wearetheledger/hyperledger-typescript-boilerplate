import { Observable } from 'rxjs';
import { Component } from '@nestjs/common';

@Component()
export class AssetsService {

    getAll() {
        return Observable.of([1, 2, 3]);
    }

}
